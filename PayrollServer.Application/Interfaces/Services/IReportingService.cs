using PayrollServer.Application.DTOs.Report;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Application.Interfaces.Services
{
    public interface IReportingService
    {
        /// <summary>
        /// Generate attendance and absence report for a specific month (US-21)
        /// </summary>
        Task<IEnumerable<AttendanceReportDto>> GetAttendanceReportAsync(int year, int month, int? departmentId = null);
        
        /// <summary>
        /// Generate incentives and deductions report for a specific month (US-22)
        /// </summary>
        Task<IEnumerable<IncentiveReportDto>> GetIncentiveReportAsync(int year, int month, int? departmentId = null);
        
        /// <summary>
        /// Generate employee directory report with active employees (US-23)
        /// </summary>
        Task<IEnumerable<EmployeeDirectoryDto>> GetEmployeeDirectoryReportAsync(int? departmentId = null);
        
        /// <summary>
        /// Generate salary report for a specific month (US-24)
        /// </summary>
        Task<(IEnumerable<SalaryReportDto> Employees, SalaryReportSummaryDto Summary)> GetSalaryReportAsync(int year, int month, int? departmentId = null);

        /// <summary>
        /// Generate salary report for a specific employee for a given month
        /// </summary>
        Task<SalaryReportDto> GetEmployeeSalaryReportAsync(int employeeId, int year, int month);
        
        /// <summary>
        /// Export report data to CSV format
        /// </summary>
        Task<byte[]> ExportToCsvAsync<T>(IEnumerable<T> data);
        
        /// <summary>
        /// Export report data to PDF format
        /// </summary>
        Task<byte[]> ExportToPdfAsync<T>(IEnumerable<T> data, string reportTitle);
    }
} 