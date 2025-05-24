using Microsoft.EntityFrameworkCore;
using PayrollServer.Domain.Entities;
using PayrollServer.Domain.Interfaces.Repositories;
using PayrollServer.Infrastructure.Data.Context;
using PayrollServer.Infrastructure.Data.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PayrollServer.Infrastructure.Repositories
{
    public class PayrollSnapshotRepository : Repository<PayrollSnapshot>, IPayrollSnapshotRepository
    {
        public PayrollSnapshotRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<PayrollSnapshot>> GetPayrollSnapshotsByYearMonthAsync(int year, int month)
        {
            return await _context.PayrollSnapshots
                .Include(p => p.Employee)
                .Where(p => p.Year == year && p.Month == month)
                .OrderBy(p => p.Employee.LastName)
                .ThenBy(p => p.Employee.FirstName)
                .ToListAsync();
        }

        public async Task<IEnumerable<PayrollSnapshot>> GetPayrollSnapshotsForEmployeeAsync(int employeeId)
        {
            return await _context.PayrollSnapshots
                .Where(p => p.EmployeeId == employeeId)
                .OrderByDescending(p => p.Year)
                .ThenByDescending(p => p.Month)
                .ToListAsync();
        }

        public async Task<PayrollSnapshot> GetPayrollSnapshotForMonthAsync(int employeeId, int year, int month)
        {
            return await _context.PayrollSnapshots
                .Include(p => p.Employee)
                .FirstOrDefaultAsync(p => 
                    p.EmployeeId == employeeId && 
                    p.Year == year && 
                    p.Month == month);
        }

        public async Task<bool> ExistsForMonthAsync(int employeeId, int year, int month)
        {
            return await _context.PayrollSnapshots
                .AnyAsync(p => 
                    p.EmployeeId == employeeId && 
                    p.Year == year && 
                    p.Month == month);
        }

        public async Task<IEnumerable<PayrollSnapshot>> GetPayrollSnapshotsByDepartmentAsync(int departmentId, int year, int month)
        {
            return await _context.PayrollSnapshots
                .Include(p => p.Employee)
                .Where(p => 
                    p.Employee.DepartmentId == departmentId && 
                    p.Year == year && 
                    p.Month == month)
                .OrderBy(p => p.Employee.LastName)
                .ThenBy(p => p.Employee.FirstName)
                .ToListAsync();
        }

        public async Task<IEnumerable<PayrollSnapshot>> GetPayrollSnapshotsForMonthAsync(int year, int month)
        {
            return await _context.PayrollSnapshots
                .Include(p => p.Employee)
                    .ThenInclude(e => e.Department)
                .Include(p => p.Employee)
                    .ThenInclude(e => e.JobGrade)
                .Where(p => p.Year == year && p.Month == month)
                .OrderBy(p => p.Employee.Department.Name)
                .ThenBy(p => p.Employee.LastName)
                .ThenBy(p => p.Employee.FirstName)
                .ToListAsync();
        }
    }
} 