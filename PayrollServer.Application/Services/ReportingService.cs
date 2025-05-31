using AutoMapper;
using Microsoft.Extensions.Logging;
using PayrollServer.Application.DTOs.Report;
using PayrollServer.Application.Interfaces.Services;
using PayrollServer.Domain.Entities;
using PayrollServer.Domain.Exceptions;
using PayrollServer.Domain.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PayrollServer.Application.Exceptions;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;
using iText.Kernel.Colors;
using iText.Layout.Borders;
using System.Reflection;

namespace PayrollServer.Application.Services
{
    public class ReportingService : IReportingService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<ReportingService> _logger;

        public ReportingService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ILogger<ReportingService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<AttendanceReportDto>> GetAttendanceReportAsync(int year, int month, int? departmentId = null)
        {
            try
            {
                // Get all active employees, optionally filtered by department
                var employees = await _unitOfWork.Employees.GetAllActiveEmployeesAsync();
                if (departmentId.HasValue)
                {
                    employees = employees.Where(e => e.DepartmentId == departmentId.Value).ToList();
                }

                var result = new List<AttendanceReportDto>();

                foreach (var employee in employees)
                {
                    // Get absence record for this employee and month
                    var absenceRecord = await _unitOfWork.AbsenceRecords.GetAbsenceRecordForMonthAsync(employee.Id, year, month);
                    
                    // Get the most recent salary for adjustment calculation
                    var lastDayOfMonth = new DateTime(year, month, DateTime.DaysInMonth(year, month));
                    var salaryRecord = await _unitOfWork.SalaryRecords.GetMostRecentSalaryAsync(employee.Id, lastDayOfMonth);
                    
                    // If no salary record exists, we'll skip this employee in the report
                    if (salaryRecord == null)
                        continue;

                    // Calculate adjustment amount based on absence record
                    decimal adjustmentAmount = 0;
                    if (absenceRecord != null && absenceRecord.AdjustmentPercentage.HasValue)
                    {
                        adjustmentAmount = salaryRecord.BaseSalary * (absenceRecord.AdjustmentPercentage.Value / 100);
                    }

                    // Create report entry
                    var reportEntry = new AttendanceReportDto
                    {
                        EmployeeId = employee.Id,
                        EmployeeNumber = employee.EmployeeNumber,
                        EmployeeName = $"{employee.FirstName} {employee.LastName}",
                        DepartmentName = employee.Department?.Name,
                        Year = year,
                        Month = month,
                        AbsenceDays = absenceRecord?.AbsenceDays ?? 0,
                        AdjustmentPercentage = absenceRecord?.AdjustmentPercentage,
                        AdjustmentAmount = adjustmentAmount,
                        LastUpdated = absenceRecord?.UpdatedAt ?? absenceRecord?.CreatedAt
                    };

                    result.Add(reportEntry);
                }

                // Sort by department and then employee name
                return result.OrderBy(r => r.DepartmentName).ThenBy(r => r.EmployeeName).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating attendance report for {Month}/{Year}", month, year);
                throw;
            }
        }

        public async Task<IEnumerable<IncentiveReportDto>> GetIncentiveReportAsync(int year, int month, int? departmentId = null)
        {
            try
            {
                // Check if we have payroll snapshots for this month
                var snapshots = await _unitOfWork.PayrollSnapshots.GetPayrollSnapshotsForMonthAsync(year, month);
                if (snapshots == null || !snapshots.Any())
                {
                    // No snapshots exist, so we need to calculate the incentives
                    return await CalculateIncentiveReportAsync(year, month, departmentId);
                }

                // Filter by department if specified
                if (departmentId.HasValue)
                {
                    snapshots = snapshots
                        .Where(s => s.Employee.DepartmentId == departmentId.Value)
                        .ToList();
                }

                // Map snapshots to incentive report DTOs
                var result = snapshots.Select(s => new IncentiveReportDto
                {
                    EmployeeId = s.EmployeeId,
                    EmployeeNumber = s.Employee?.EmployeeNumber,
                    EmployeeName = s.Employee != null ? $"{s.Employee.FirstName} {s.Employee.LastName}" : "Unknown",
                    DepartmentName = s.Employee?.Department?.Name,
                    Year = s.Year,
                    Month = s.Month,
                    BaseSalary = s.BaseSalary,
                    DepartmentIncentiveAmount = s.DepartmentIncentiveAmount,
                    ServiceYearsIncentiveAmount = s.ServiceYearsIncentiveAmount,
                    AttendanceAdjustmentAmount = s.AttendanceAdjustmentAmount
                }).ToList();

                // Sort by department and then employee name
                return result.OrderBy(r => r.DepartmentName).ThenBy(r => r.EmployeeName).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating incentive report for {Month}/{Year}", month, year);
                throw;
            }
        }

        private async Task<IEnumerable<IncentiveReportDto>> CalculateIncentiveReportAsync(int year, int month, int? departmentId = null)
        {
            // Get all active employees, optionally filtered by department
            var employees = await _unitOfWork.Employees.GetAllActiveEmployeesAsync();
            if (departmentId.HasValue)
            {
                employees = employees.Where(e => e.DepartmentId == departmentId.Value).ToList();
            }

            var result = new List<IncentiveReportDto>();
            var lastDayOfMonth = new DateTime(year, month, DateTime.DaysInMonth(year, month));

            foreach (var employee in employees)
            {
                try
                {
                    // Get the most recent salary for this month
                    var salaryRecord = await _unitOfWork.SalaryRecords.GetMostRecentSalaryAsync(employee.Id, lastDayOfMonth);
                    if (salaryRecord == null)
                        continue;

                    // Calculate years of service
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

                    // Get service bracket incentive
                    var serviceBracket = await _unitOfWork.ServiceBrackets.GetServiceBracketForYearsOfServiceAsync(yearsOfService);
                    decimal serviceYearsIncentiveAmount = 0;
                    if (serviceBracket != null && serviceBracket.IncentivePercentage > 0)
                    {
                        serviceYearsIncentiveAmount = salaryRecord.BaseSalary * (serviceBracket.IncentivePercentage / 100);
                    }

                    // Get department incentive
                    decimal departmentIncentiveAmount = 0;
                    if (employee.Department?.IncentivePercentage.HasValue == true)
                    {
                        departmentIncentiveAmount = salaryRecord.BaseSalary * (employee.Department.IncentivePercentage.Value / 100);
                    }

                    // Get attendance adjustment
                    var absenceRecord = await _unitOfWork.AbsenceRecords.GetAbsenceRecordForMonthAsync(employee.Id, year, month);
                    decimal attendanceAdjustmentAmount = 0;
                    if (absenceRecord != null && absenceRecord.AdjustmentPercentage.HasValue)
                    {
                        attendanceAdjustmentAmount = salaryRecord.BaseSalary * (absenceRecord.AdjustmentPercentage.Value / 100);
                    }

                    // Create report entry
                    var reportEntry = new IncentiveReportDto
                    {
                        EmployeeId = employee.Id,
                        EmployeeNumber = employee.EmployeeNumber,
                        EmployeeName = $"{employee.FirstName} {employee.LastName}",
                        DepartmentName = employee.Department?.Name,
                        Year = year,
                        Month = month,
                        BaseSalary = salaryRecord.BaseSalary,
                        DepartmentIncentiveAmount = departmentIncentiveAmount,
                        ServiceYearsIncentiveAmount = serviceYearsIncentiveAmount,
                        AttendanceAdjustmentAmount = attendanceAdjustmentAmount
                    };

                    result.Add(reportEntry);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error calculating incentives for employee {EmployeeId} for {Month}/{Year}", 
                        employee.Id, month, year);
                    // Continue with next employee
                }
            }

            return result.OrderBy(r => r.DepartmentName).ThenBy(r => r.EmployeeName).ToList();
        }

        public async Task<IEnumerable<EmployeeDirectoryDto>> GetEmployeeDirectoryReportAsync(int? departmentId = null)
        {
            try
            {
                // Get all active employees
                var employees = await _unitOfWork.Employees.GetAllActiveEmployeesAsync();
                
                // Filter by department if specified
                if (departmentId.HasValue)
                {
                    employees = employees.Where(e => e.DepartmentId == departmentId.Value).ToList();
                }

                var today = DateTime.UtcNow;
                var result = new List<EmployeeDirectoryDto>();

                foreach (var employee in employees)
                {
                    // Calculate years of service
                    int? yearsOfService = null;
                    if (employee.HiringDate.HasValue)
                    {
                        var hireDate = employee.HiringDate.Value;
                        yearsOfService = today.Year - hireDate.Year;
                        if (today.Month < hireDate.Month || (today.Month == hireDate.Month && today.Day < hireDate.Day))
                        {
                            yearsOfService--;
                        }
                    }

                    var directoryEntry = new EmployeeDirectoryDto
                    {
                        Id = employee.Id,
                        EmployeeNumber = employee.EmployeeNumber,
                        FullName = $"{employee.FirstName} {employee.LastName}",
                        DepartmentName = employee.Department?.Name,
                        JobGradeName = employee.JobGrade?.Name,
                        Email = employee.Email,
                        PhoneNumber = employee.PhoneNumber,
                        Address = employee.Address,
                        HiringDate = employee.HiringDate,
                        YearsOfService = yearsOfService
                    };

                    result.Add(directoryEntry);
                }

                // Sort by department and then employee name
                return result.OrderBy(r => r.DepartmentName).ThenBy(r => r.FullName).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating employee directory report");
                throw;
            }
        }

        public async Task<(IEnumerable<SalaryReportDto> Employees, SalaryReportSummaryDto Summary)> GetSalaryReportAsync(int year, int month, int? departmentId = null)
        {
            try
            {
                // Prepare summary object
                var summary = new SalaryReportSummaryDto
                {
                    Year = year,
                    Month = month,
                    TotalEmployees = 0,
                    TotalBaseSalary = 0,
                    TotalGrossSalary = 0
                };

                // Get all active employees
                var employees = await _unitOfWork.Employees.GetAllActiveEmployeesAsync();
                
                // Filter by department if specified
                if (departmentId.HasValue)
                {
                    employees = employees.Where(e => e.DepartmentId == departmentId.Value).ToList();
                }

                // Get payroll snapshots for this month
                var snapshots = await _unitOfWork.PayrollSnapshots.GetPayrollSnapshotsForMonthAsync(year, month);
                
                var result = new List<SalaryReportDto>();
                var departmentSummaries = new Dictionary<string, DepartmentSalarySummaryDto>();

                foreach (var employee in employees)
                {
                    // Look for an existing snapshot for this employee
                    var snapshot = snapshots?.FirstOrDefault(s => s.EmployeeId == employee.Id);
                    
                    // Get the most recent salary record if no snapshot exists
                    decimal baseSalary;
                    decimal grossSalary;
                    bool hasPayrollRecord = snapshot != null;

                    if (snapshot != null)
                    {
                        baseSalary = snapshot.BaseSalary;
                        grossSalary = snapshot.GrossSalary;
                    }
                    else
                    {
                        // Calculate basic salary from salary records
                        var lastDayOfMonth = new DateTime(year, month, DateTime.DaysInMonth(year, month));
                        var salaryRecord = await _unitOfWork.SalaryRecords.GetMostRecentSalaryAsync(employee.Id, lastDayOfMonth);
                        
                        // Skip employee if no salary record exists
                        if (salaryRecord == null)
                            continue;
                            
                        baseSalary = salaryRecord.BaseSalary;
                        grossSalary = baseSalary; // Without all incentives calculated
                    }

                    // Create salary report entry
                    var reportEntry = new SalaryReportDto
                    {
                        EmployeeId = employee.Id,
                        EmployeeNumber = employee.EmployeeNumber,
                        EmployeeName = $"{employee.FirstName} {employee.LastName}",
                        DepartmentName = employee.Department?.Name ?? "Unknown",
                        JobGradeName = employee.JobGrade?.Name ?? "Unknown",
                        Year = year,
                        Month = month,
                        BaseSalary = baseSalary,
                        GrossSalary = grossSalary,
                        HasPayrollRecord = hasPayrollRecord
                    };

                    result.Add(reportEntry);

                    // Update overall summary
                    summary.TotalEmployees++;
                    summary.TotalBaseSalary += baseSalary;
                    summary.TotalGrossSalary += grossSalary;

                    // Update department summary
                    string deptName = employee.Department?.Name ?? "Unknown";
                    if (!departmentSummaries.ContainsKey(deptName))
                    {
                        departmentSummaries[deptName] = new DepartmentSalarySummaryDto
                        {
                            DepartmentName = deptName,
                            EmployeeCount = 0,
                            TotalBaseSalary = 0,
                            TotalGrossSalary = 0
                        };
                    }

                    departmentSummaries[deptName].EmployeeCount++;
                    departmentSummaries[deptName].TotalBaseSalary += baseSalary;
                    departmentSummaries[deptName].TotalGrossSalary += grossSalary;
                }

                // Add department summaries to the main summary
                summary.DepartmentSummaries = departmentSummaries;

                // Sort by department and then employee name
                var sortedResult = result.OrderBy(r => r.DepartmentName).ThenBy(r => r.EmployeeName).ToList();
                
                return (sortedResult, summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating salary report for {Month}/{Year}", month, year);
                throw;
            }
        }

        public async Task<SalaryReportDto> GetEmployeeSalaryReportAsync(int employeeId, int year, int month)
        {
            try
            {
                // Get the employee
                var employee = await _unitOfWork.Employees.GetEmployeeWithDetailsAsync(employeeId);
                if (employee == null)
                {
                    throw new EntityNotFoundException("Employee", employeeId);
                }

                // Check if we have a payroll snapshot for this employee and month
                var snapshot = await _unitOfWork.PayrollSnapshots.GetPayrollSnapshotForMonthAsync(employeeId, year, month);
                
                // Get the most recent salary record if no snapshot exists
                decimal baseSalary;
                decimal grossSalary;
                bool hasPayrollRecord = snapshot != null;

                if (snapshot != null)
                {
                    // Use values from the snapshot
                    baseSalary = snapshot.BaseSalary;
                    grossSalary = snapshot.GrossSalary;
                }
                else
                {
                    // Calculate basic salary from salary records
                    var lastDayOfMonth = new DateTime(year, month, DateTime.DaysInMonth(year, month));
                    var salaryRecord = await _unitOfWork.SalaryRecords.GetMostRecentSalaryAsync(employeeId, lastDayOfMonth);
                    
                    // If no salary record exists for this period, throw an exception
                    if (salaryRecord == null)
                    {
                        throw new BusinessRuleViolationException("No salary record", 
                            $"No salary record found for employee ID {employeeId} effective on or before {lastDayOfMonth:yyyy-MM-dd}");
                    }
                        
                    baseSalary = salaryRecord.BaseSalary;
                    
                    // Calculate approximate gross salary without a full snapshot
                    // This is simplified and doesn't include all incentives and adjustments
                    grossSalary = baseSalary;
                    
                    // Add department incentive if applicable
                    if (employee.Department?.IncentivePercentage.HasValue == true)
                    {
                        grossSalary += baseSalary * (employee.Department.IncentivePercentage.Value / 100);
                    }
                    
                    // Try to get service years incentive
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
                    
                    var serviceBracket = await _unitOfWork.ServiceBrackets.GetServiceBracketForYearsOfServiceAsync(yearsOfService);
                    if (serviceBracket?.IncentivePercentage > 0)
                    {
                        grossSalary += baseSalary * (serviceBracket.IncentivePercentage / 100);
                    }
                    
                    // Try to get attendance adjustment
                    var absenceRecord = await _unitOfWork.AbsenceRecords.GetAbsenceRecordForMonthAsync(employeeId, year, month);
                    if (absenceRecord?.AdjustmentPercentage.HasValue == true)
                    {
                        grossSalary += baseSalary * (absenceRecord.AdjustmentPercentage.Value / 100);
                    }
                }

                // Create salary report entry
                var reportEntry = new SalaryReportDto
                {
                    EmployeeId = employee.Id,
                    EmployeeNumber = employee.EmployeeNumber,
                    EmployeeName = $"{employee.FirstName} {employee.LastName}",
                    DepartmentName = employee.Department?.Name ?? "Unknown",
                    JobGradeName = employee.JobGrade?.Name ?? "Unknown",
                    Year = year,
                    Month = month,
                    BaseSalary = baseSalary,
                    GrossSalary = grossSalary,
                    HasPayrollRecord = hasPayrollRecord
                };

                return reportEntry;
            }
            catch (EntityNotFoundException)
            {
                throw; // Rethrow entity not found exceptions
            }
            catch (BusinessRuleViolationException)
            {
                throw; // Rethrow business rule violations
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating salary report for employee {EmployeeId} for {Month}/{Year}", employeeId, month, year);
                throw;
            }
        }

        public async Task<byte[]> ExportToCsvAsync<T>(IEnumerable<T> data)
        {
            // Simple CSV export implementation
            var properties = typeof(T).GetProperties()
                .Where(p => p.CanRead && 
                       (p.PropertyType.IsPrimitive || 
                        p.PropertyType == typeof(string) || 
                        p.PropertyType == typeof(decimal) || 
                        p.PropertyType == typeof(DateTime) || 
                        p.PropertyType == typeof(DateTime?)))
                .ToArray();

            var builder = new StringBuilder();

            // Write header
            builder.AppendLine(string.Join(",", properties.Select(p => $"\"{p.Name}\"")));

            // Write rows
            foreach (var item in data)
            {
                var values = properties.Select(p => 
                {
                    var value = p.GetValue(item);
                    if (value == null)
                        return "\"\"";
                    if (value is DateTime dateTime)
                        return $"\"{dateTime:yyyy-MM-dd}\"";
                    if (value is DateTime?)
                    {
                        var nullableDate = (DateTime?)value;
                        if (nullableDate.HasValue)
                            return $"\"{nullableDate.Value:yyyy-MM-dd}\"";
                        return "\"\"";
                    }
                    return $"\"{value}\"";
                });
                
                builder.AppendLine(string.Join(",", values));
            }

            return Encoding.UTF8.GetBytes(builder.ToString());
        }

        public async Task<byte[]> ExportToPdfAsync<T>(IEnumerable<T> data, string reportTitle)
        {
            try
            {
                using var memoryStream = new MemoryStream();
                var writer = new PdfWriter(memoryStream);
                var pdf = new PdfDocument(writer);
                var document = new Document(pdf);

                // Add title
                document.Add(new Paragraph(reportTitle)
                    .SetTextAlignment(TextAlignment.CENTER)
                    .SetFontSize(18)
                    .SetBold()
                    .SetMarginBottom(20));

                // Add generation timestamp
                document.Add(new Paragraph($"Generated on: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC")
                    .SetTextAlignment(TextAlignment.RIGHT)
                    .SetFontSize(10)
                    .SetItalic()
                    .SetMarginBottom(20));

                var dataList = data.ToList();
                if (!dataList.Any())
                {
                    document.Add(new Paragraph("No data available for this report.")
                        .SetTextAlignment(TextAlignment.CENTER)
                        .SetFontSize(12)
                        .SetMarginTop(50));
                }
                else
                {
                    // Get properties for table headers
                    var properties = typeof(T).GetProperties()
                        .Where(p => p.CanRead && 
                               (p.PropertyType.IsPrimitive || 
                                p.PropertyType == typeof(string) || 
                                p.PropertyType == typeof(decimal) || 
                                p.PropertyType == typeof(DateTime) || 
                                p.PropertyType == typeof(DateTime?) ||
                                Nullable.GetUnderlyingType(p.PropertyType)?.IsPrimitive == true))
                        .ToArray();

                    // Create table
                    var table = new Table(properties.Length, true);
                    table.SetWidth(UnitValue.CreatePercentValue(100));

                    // Add headers
                    foreach (var property in properties)
                    {
                        table.AddHeaderCell(new Cell()
                            .Add(new Paragraph(FormatPropertyName(property.Name)))
                            .SetBackgroundColor(ColorConstants.LIGHT_GRAY)
                            .SetBold()
                            .SetTextAlignment(TextAlignment.CENTER)
                            .SetBorder(new SolidBorder(1)));
                    }

                    // Add data rows
                    foreach (var item in dataList)
                    {
                        foreach (var property in properties)
                        {
                            var value = property.GetValue(item);
                            var cellText = FormatCellValue(value);
                            
                            var cell = new Cell()
                                .Add(new Paragraph(cellText))
                                .SetBorder(new SolidBorder(0.5f))
                                .SetPadding(5);

                            // Right-align numeric values
                            if (IsNumericProperty(property))
                            {
                                cell.SetTextAlignment(TextAlignment.RIGHT);
                            }
                            
                            table.AddCell(cell);
                        }
                    }

                    document.Add(table);
                }

                // Add footer
                document.Add(new Paragraph($"Total records: {dataList.Count}")
                    .SetTextAlignment(TextAlignment.LEFT)
                    .SetFontSize(10)
                    .SetMarginTop(20));

                document.Close();
                return memoryStream.ToArray();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating PDF for report: {ReportTitle}", reportTitle);
                throw new InvalidOperationException($"Failed to generate PDF report: {ex.Message}", ex);
            }
        }

        private string FormatPropertyName(string propertyName)
        {
            // Convert PascalCase to readable format
            var result = string.Concat(propertyName.Select((x, i) => i > 0 && char.IsUpper(x) ? " " + x : x.ToString()));
            return result;
        }

        private string FormatCellValue(object? value)
        {
            if (value == null)
                return string.Empty;

            // Handle different types with explicit type checking
            if (value is DateTime dateTime)
                return dateTime.ToString("yyyy-MM-dd");
            
            if (value is decimal decimalValue)
                return decimalValue.ToString("N2");
                
            if (value is double doubleValue)
                return doubleValue.ToString("N2");
                
            if (value is float floatValue)
                return floatValue.ToString("N2");
                
            if (value is bool boolValue)
                return boolValue ? "Yes" : "No";
                
            return value.ToString() ?? string.Empty;
        }

        private bool IsNumericProperty(PropertyInfo property)
        {
            var type = Nullable.GetUnderlyingType(property.PropertyType) ?? property.PropertyType;
            return type == typeof(decimal) || 
                   type == typeof(double) || 
                   type == typeof(float) || 
                   type == typeof(int) || 
                   type == typeof(long) || 
                   type == typeof(short);
        }
    }
} 