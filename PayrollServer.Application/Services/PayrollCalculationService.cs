using AutoMapper;
using Microsoft.Extensions.Logging;
using PayrollServer.Application.DTOs.PayrollSnapshot;
using PayrollServer.Application.Interfaces.Services;
using PayrollServer.Domain.Entities;
using PayrollServer.Domain.Exceptions;
using PayrollServer.Domain.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PayrollServer.Application.Services
{
    public class PayrollCalculationService : IPayrollCalculationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<PayrollCalculationService> _logger;

        public PayrollCalculationService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ILogger<PayrollCalculationService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<PayrollSnapshotDto> CalculateGrossPayAsync(int employeeId, int year, int month)
        {
            // Get employee with related data
            var employee = await _unitOfWork.Employees.GetByIdWithDetailsAsync(employeeId);
            if (employee == null)
            {
                throw new EntityNotFoundException("Employee", employeeId);
            }

            // Check if snapshot already exists
            var existingSnapshot = await _unitOfWork.PayrollSnapshots.GetPayrollSnapshotForMonthAsync(employeeId, year, month);
            if (existingSnapshot != null)
            {
                return _mapper.Map<PayrollSnapshotDto>(existingSnapshot);
            }

            // Get the most recent salary record that is effective before or on the calculated month's last day
            var lastDayOfMonth = new DateTime(year, month, DateTime.DaysInMonth(year, month));
            var salaryRecord = await _unitOfWork.SalaryRecords.GetMostRecentSalaryAsync(employeeId, lastDayOfMonth);
            if (salaryRecord == null)
            {
                throw new BusinessRuleViolationException(
                    "No salary record found", 
                    $"Employee {employeeId} has no salary record effective on or before {lastDayOfMonth:yyyy-MM-dd}");
            }

            // Calculate years of service as of the last day of the month
            var yearsOfService = 0;
            if (employee.HiringDate.HasValue)
            {
                var hireDate = employee.HiringDate.Value;
                yearsOfService = lastDayOfMonth.Year - hireDate.Year;
                if (lastDayOfMonth.Month < hireDate.Month || (lastDayOfMonth.Month == hireDate.Month && lastDayOfMonth.Day < hireDate.Day))
                {
                    yearsOfService--;
                }
            }

            // Get service bracket based on years of service
            var serviceBracket = await _unitOfWork.ServiceBrackets.GetServiceBracketForYearsOfServiceAsync(yearsOfService);
            decimal? serviceYearsIncentivePercentage = serviceBracket?.IncentivePercentage;

            // Get absence record and threshold for the month
            var absenceRecord = await _unitOfWork.AbsenceRecords.GetAbsenceRecordForMonthAsync(employeeId, year, month);
            decimal? attendanceAdjustmentPercentage = absenceRecord?.AdjustmentPercentage;
            var absenceDays = absenceRecord?.AbsenceDays ?? 0;

            // Get department incentive percentage
            decimal? departmentIncentivePercentage = employee.Department?.IncentivePercentage;

            // Calculate incentive and adjustment amounts
            var baseSalary = salaryRecord.BaseSalary;
            var departmentIncentiveAmount = departmentIncentivePercentage.HasValue 
                ? baseSalary * (departmentIncentivePercentage.Value / 100) 
                : 0;
            var serviceYearsIncentiveAmount = serviceYearsIncentivePercentage.HasValue 
                ? baseSalary * (serviceYearsIncentivePercentage.Value / 100) 
                : 0;
            var attendanceAdjustmentAmount = attendanceAdjustmentPercentage.HasValue 
                ? baseSalary * (attendanceAdjustmentPercentage.Value / 100) 
                : 0;

            // Calculate gross salary
            var grossSalary = baseSalary + departmentIncentiveAmount + serviceYearsIncentiveAmount + attendanceAdjustmentAmount;

            // Create payroll snapshot object (not yet persisted)
            var payrollSnapshot = new PayrollSnapshot
            {
                EmployeeId = employeeId,
                Year = year,
                Month = month,
                BaseSalary = baseSalary,
                DepartmentIncentiveAmount = departmentIncentiveAmount,
                ServiceYearsIncentiveAmount = serviceYearsIncentiveAmount,
                AttendanceAdjustmentAmount = attendanceAdjustmentAmount,
                GrossSalary = grossSalary,
                DepartmentIncentivePercentage = departmentIncentivePercentage,
                ServiceYearsIncentivePercentage = serviceYearsIncentivePercentage,
                AttendanceAdjustmentPercentage = attendanceAdjustmentPercentage,
                AbsenceDays = absenceDays,
                YearsOfService = yearsOfService
            };

            // Map to DTO and enrich with employee info
            var payrollSnapshotDto = _mapper.Map<PayrollSnapshotDto>(payrollSnapshot);
            payrollSnapshotDto.EmployeeName = $"{employee.FirstName} {employee.LastName}";
            payrollSnapshotDto.EmployeeNumber = employee.EmployeeNumber;
            payrollSnapshotDto.DepartmentName = employee.Department?.Name;
            payrollSnapshotDto.JobGradeName = employee.JobGrade?.Name;

            return payrollSnapshotDto;
        }

        public async Task<IEnumerable<PayrollSnapshotDto>> CalculateGrossPayForAllAsync(int year, int month)
        {
            var employees = await _unitOfWork.Employees.GetAllActiveEmployeesAsync();
            var results = new List<PayrollSnapshotDto>();

            foreach (var employee in employees)
            {
                try
                {
                    var payrollSnapshot = await CalculateGrossPayAsync(employee.Id, year, month);
                    results.Add(payrollSnapshot);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to calculate gross pay for employee {EmployeeId} for {Month}/{Year}", 
                        employee.Id, month, year);
                    // Continue with next employee
                }
            }

            return results;
        }

        public async Task<bool> GenerateMonthlyPayrollSnapshotsAsync(int year, int month)
        {
            var employees = await _unitOfWork.Employees.GetAllActiveEmployeesAsync();
            var successCount = 0;

            foreach (var employee in employees)
            {
                try
                {
                    // Check if snapshot already exists
                    bool exists = await _unitOfWork.PayrollSnapshots.ExistsForMonthAsync(employee.Id, year, month);
                    if (exists)
                    {
                        _logger.LogInformation("Payroll snapshot already exists for employee {EmployeeId} for {Month}/{Year}", 
                            employee.Id, month, year);
                        successCount++;
                        continue;
                    }

                    // Calculate gross pay
                    var payrollSnapshotDto = await CalculateGrossPayAsync(employee.Id, year, month);
                    
                    // Map back to entity for persistence
                    var payrollSnapshot = _mapper.Map<PayrollSnapshot>(payrollSnapshotDto);
                    
                    // Save to database
                    await _unitOfWork.PayrollSnapshots.AddAsync(payrollSnapshot);
                    await _unitOfWork.CompleteAsync();
                    
                    successCount++;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to generate payroll snapshot for employee {EmployeeId} for {Month}/{Year}", 
                        employee.Id, month, year);
                    // Continue with next employee
                }
            }

            // Return true if at least 50% of employees were processed successfully
            return successCount >= (employees.Count() / 2);
        }

        public async Task<IEnumerable<PayrollSnapshotDto>> GetPayrollSnapshotsAsync(int year, int month)
        {
            var snapshots = await _unitOfWork.PayrollSnapshots.GetPayrollSnapshotsByYearMonthAsync(year, month);
            return _mapper.Map<IEnumerable<PayrollSnapshotDto>>(snapshots);
        }

        public async Task<IEnumerable<PayrollSnapshotDto>> GetPayrollSnapshotsForEmployeeAsync(int employeeId)
        {
            var snapshots = await _unitOfWork.PayrollSnapshots.GetPayrollSnapshotsForEmployeeAsync(employeeId);
            return _mapper.Map<IEnumerable<PayrollSnapshotDto>>(snapshots);
        }

        public async Task<PayrollSnapshotDto> GetPayrollSnapshotAsync(int employeeId, int year, int month)
        {
            var snapshot = await _unitOfWork.PayrollSnapshots.GetPayrollSnapshotForMonthAsync(employeeId, year, month);
            
            if (snapshot == null)
            {
                throw new EntityNotFoundException("PayrollSnapshot", $"for employee {employeeId} in {month}/{year}");
            }
            
            return _mapper.Map<PayrollSnapshotDto>(snapshot);
        }

        public async Task<IEnumerable<PayrollSnapshotDto>> GetPayrollSnapshotsByDepartmentAsync(int departmentId, int year, int month)
        {
            var snapshots = await _unitOfWork.PayrollSnapshots.GetPayrollSnapshotsByDepartmentAsync(departmentId, year, month);
            return _mapper.Map<IEnumerable<PayrollSnapshotDto>>(snapshots);
        }
    }
} 