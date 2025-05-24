using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.Logging;
using PayrollServer.Application.DTOs.SalaryRecord;
using PayrollServer.Application.Features.SalaryRecord.Requests;
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
    public class SalaryRecordService : ISalaryRecordService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IValidator<CreateSalaryRecordRequest> _createValidator;
        private readonly IValidator<UpdateSalaryRecordRequest> _updateValidator;
        private readonly ILogger<SalaryRecordService> _logger;

        public SalaryRecordService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IValidator<CreateSalaryRecordRequest> createValidator,
            IValidator<UpdateSalaryRecordRequest> updateValidator,
            ILogger<SalaryRecordService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
            _logger = logger;
        }

        public async Task<IEnumerable<SalaryRecordDto>> GetAllSalaryRecordsAsync(int? employeeId = null)
        {
            IEnumerable<SalaryRecord> salaryRecords;

            if (employeeId.HasValue)
            {
                salaryRecords = await _unitOfWork.SalaryRecords.GetSalaryRecordsForEmployeeAsync(employeeId.Value);
            }
            else
            {
                salaryRecords = await _unitOfWork.SalaryRecords.GetAllAsync();
            }

            return _mapper.Map<IEnumerable<SalaryRecordDto>>(salaryRecords);
        }

        public async Task<SalaryRecordDto> GetSalaryRecordByIdAsync(int id)
        {
            var salaryRecord = await _unitOfWork.SalaryRecords.GetByIdAsync(id);
            
            if (salaryRecord == null)
            {
                throw new EntityNotFoundException("SalaryRecord", id);
            }
            
            return _mapper.Map<SalaryRecordDto>(salaryRecord);
        }

        public async Task<IEnumerable<SalaryRecordDto>> GetSalaryHistoryForEmployeeAsync(int employeeId)
        {
            // Verify employee exists
            var employee = await _unitOfWork.Employees.GetByIdAsync(employeeId);
            if (employee == null)
            {
                throw new EntityNotFoundException("Employee", employeeId);
            }

            var salaryRecords = await _unitOfWork.SalaryRecords.GetSalaryRecordsForEmployeeAsync(employeeId);
            return _mapper.Map<IEnumerable<SalaryRecordDto>>(salaryRecords);
        }

        public async Task<SalaryRecordDto> GetCurrentSalaryForEmployeeAsync(int employeeId)
        {
            // Verify employee exists
            var employee = await _unitOfWork.Employees.GetByIdAsync(employeeId);
            if (employee == null)
            {
                throw new EntityNotFoundException("Employee", employeeId);
            }

            var salaryRecord = await _unitOfWork.SalaryRecords.GetCurrentSalaryForEmployeeAsync(employeeId);
            if (salaryRecord == null)
            {
                throw new BusinessRuleViolationException("No salary record", $"No salary record found for employee ID {employeeId}");
            }

            return _mapper.Map<SalaryRecordDto>(salaryRecord);
        }

        public async Task<SalaryRecordDto> CreateSalaryRecordAsync(CreateSalaryRecordRequest request)
        {
            // Validate request
            var validationResult = await _createValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            // Verify employee exists
            var employee = await _unitOfWork.Employees.GetEmployeeWithDetailsAsync(request.EmployeeId);
            if (employee == null)
            {
                throw new EntityNotFoundException("Employee", request.EmployeeId);
            }

            // Verify salary is within job grade range
            if (request.BaseSalary < employee.JobGrade.MinSalary || request.BaseSalary > employee.JobGrade.MaxSalary)
            {
                throw new BusinessRuleViolationException(
                    "Invalid salary", 
                    $"Salary must be between {employee.JobGrade.MinSalary} and {employee.JobGrade.MaxSalary} for the selected job grade"
                );
            }

            // Check for duplicate effective date
            var isDuplicateDate = await _unitOfWork.SalaryRecords.IsDuplicateEffectiveDateAsync(
                request.EmployeeId, 
                request.EffectiveDate
            );
            
            if (isDuplicateDate)
            {
                throw new BusinessRuleViolationException(
                    "Duplicate effective date", 
                    $"A salary record with the same effective date already exists for this employee"
                );
            }

            // Create new salary record
            var salaryRecord = new SalaryRecord
            {
                EmployeeId = request.EmployeeId,
                BaseSalary = request.BaseSalary,
                EffectiveDate = request.EffectiveDate,
                Notes = request.Notes
            };
            
            await _unitOfWork.SalaryRecords.AddAsync(salaryRecord);
            await _unitOfWork.CompleteAsync();

            // Populate DTO with employee details
            var salaryRecordDto = _mapper.Map<SalaryRecordDto>(salaryRecord);
            salaryRecordDto.EmployeeName = $"{employee.FirstName} {employee.LastName}";
            salaryRecordDto.EmployeeNumber = employee.EmployeeId;

            return salaryRecordDto;
        }

        public async Task<SalaryRecordDto> UpdateSalaryRecordAsync(int id, UpdateSalaryRecordRequest request)
        {
            // Validate request
            var validationResult = await _updateValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            // Get existing salary record
            var salaryRecord = await _unitOfWork.SalaryRecords.GetByIdAsync(id);
            if (salaryRecord == null)
            {
                throw new EntityNotFoundException("SalaryRecord", id);
            }

            // Get employee with job grade info for validation
            var employee = await _unitOfWork.Employees.GetEmployeeWithDetailsAsync(salaryRecord.EmployeeId);
            
            // Verify salary is within job grade range
            if (request.BaseSalary < employee.JobGrade.MinSalary || request.BaseSalary > employee.JobGrade.MaxSalary)
            {
                throw new BusinessRuleViolationException(
                    "Invalid salary", 
                    $"Salary must be between {employee.JobGrade.MinSalary} and {employee.JobGrade.MaxSalary} for the selected job grade"
                );
            }

            // Check for duplicate effective date if date is changing
            if (salaryRecord.EffectiveDate != request.EffectiveDate)
            {
                var isDuplicateDate = await _unitOfWork.SalaryRecords.IsDuplicateEffectiveDateAsync(
                    salaryRecord.EmployeeId, 
                    request.EffectiveDate,
                    id
                );
                
                if (isDuplicateDate)
                {
                    throw new BusinessRuleViolationException(
                        "Duplicate effective date", 
                        $"A salary record with the same effective date already exists for this employee"
                    );
                }
            }

            // Update salary record
            salaryRecord.BaseSalary = request.BaseSalary;
            salaryRecord.EffectiveDate = request.EffectiveDate;
            salaryRecord.Notes = request.Notes;
            
            _unitOfWork.SalaryRecords.Update(salaryRecord);
            await _unitOfWork.CompleteAsync();

            // Populate DTO with employee details
            var salaryRecordDto = _mapper.Map<SalaryRecordDto>(salaryRecord);
            salaryRecordDto.EmployeeName = $"{employee.FirstName} {employee.LastName}";
            salaryRecordDto.EmployeeNumber = employee.EmployeeId;

            return salaryRecordDto;
        }

        public async Task<bool> DeleteSalaryRecordAsync(int id)
        {
            // Get existing salary record
            var salaryRecord = await _unitOfWork.SalaryRecords.GetByIdAsync(id);
            if (salaryRecord == null)
            {
                throw new EntityNotFoundException("SalaryRecord", id);
            }

            // Check if this is the only salary record for the employee
            var employeeSalaryRecords = await _unitOfWork.SalaryRecords.GetSalaryRecordsForEmployeeAsync(salaryRecord.EmployeeId);
            var recordCount = employeeSalaryRecords.Count(record => record.Id != id);
            
            if (recordCount == 0)
            {
                throw new BusinessRuleViolationException(
                    "Cannot delete only salary record", 
                    "Cannot delete the only salary record for an employee"
                );
            }

            // Delete salary record
            _unitOfWork.SalaryRecords.Remove(salaryRecord);
            await _unitOfWork.CompleteAsync();

            return true;
        }
    }
} 