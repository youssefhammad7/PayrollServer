using PayrollServer.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Domain.Interfaces.Repositories
{
    public interface IPayrollSnapshotRepository : IRepository<PayrollSnapshot>
    {
        Task<IEnumerable<PayrollSnapshot>> GetPayrollSnapshotsByYearMonthAsync(int year, int month);
        
        Task<IEnumerable<PayrollSnapshot>> GetPayrollSnapshotsForEmployeeAsync(int employeeId);
        
        Task<PayrollSnapshot> GetPayrollSnapshotForMonthAsync(int employeeId, int year, int month);
        
        Task<bool> ExistsForMonthAsync(int employeeId, int year, int month);
        
        Task<IEnumerable<PayrollSnapshot>> GetPayrollSnapshotsByDepartmentAsync(int departmentId, int year, int month);
        
        /// <summary>
        /// Get all payroll snapshots for a specific month with employee and department details
        /// </summary>
        Task<IEnumerable<PayrollSnapshot>> GetPayrollSnapshotsForMonthAsync(int year, int month);
    }
} 