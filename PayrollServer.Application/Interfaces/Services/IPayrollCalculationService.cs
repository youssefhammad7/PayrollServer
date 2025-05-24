using PayrollServer.Application.DTOs.PayrollSnapshot;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Application.Interfaces.Services
{
    public interface IPayrollCalculationService
    {
        /// <summary>
        /// Calculate gross pay for a specific employee for a given month
        /// </summary>
        Task<PayrollSnapshotDto> CalculateGrossPayAsync(int employeeId, int year, int month);
        
        /// <summary>
        /// Calculate gross pay for all employees for a given month
        /// </summary>
        Task<IEnumerable<PayrollSnapshotDto>> CalculateGrossPayForAllAsync(int year, int month);
        
        /// <summary>
        /// Generate and persist payroll snapshots for all employees for a given month
        /// </summary>
        Task<bool> GenerateMonthlyPayrollSnapshotsAsync(int year, int month);
        
        /// <summary>
        /// Get payroll snapshots for a specific month
        /// </summary>
        Task<IEnumerable<PayrollSnapshotDto>> GetPayrollSnapshotsAsync(int year, int month);
        
        /// <summary>
        /// Get payroll snapshots for a specific employee
        /// </summary>
        Task<IEnumerable<PayrollSnapshotDto>> GetPayrollSnapshotsForEmployeeAsync(int employeeId);
        
        /// <summary>
        /// Get payroll snapshot for a specific employee for a given month
        /// </summary>
        Task<PayrollSnapshotDto> GetPayrollSnapshotAsync(int employeeId, int year, int month);
        
        /// <summary>
        /// Get payroll snapshots for a specific department for a given month
        /// </summary>
        Task<IEnumerable<PayrollSnapshotDto>> GetPayrollSnapshotsByDepartmentAsync(int departmentId, int year, int month);
    }
} 