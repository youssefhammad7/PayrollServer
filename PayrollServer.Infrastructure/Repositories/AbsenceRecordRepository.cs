using Microsoft.EntityFrameworkCore;
using PayrollServer.Domain.Entities;
using PayrollServer.Domain.Interfaces.Repositories;
using PayrollServer.Infrastructure.Data.Context;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PayrollServer.Infrastructure.Repositories
{
    public class AbsenceRecordRepository : Repository<AbsenceRecord>, IAbsenceRecordRepository
    {
        public AbsenceRecordRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<AbsenceRecord>> GetAbsenceRecordsForEmployeeAsync(int employeeId)
        {
            return await _context.AbsenceRecords
                .Where(a => a.EmployeeId == employeeId)
                .OrderByDescending(a => a.Year)
                .ThenByDescending(a => a.Month)
                .ToListAsync();
        }

        public async Task<AbsenceRecord> GetAbsenceRecordForMonthAsync(int employeeId, int year, int month)
        {
            return await _context.AbsenceRecords
                .FirstOrDefaultAsync(a => 
                    a.EmployeeId == employeeId && 
                    a.Year == year && 
                    a.Month == month);
        }

        public async Task<bool> IsDuplicateMonthAsync(int employeeId, int year, int month, int? excludeId = null)
        {
            var query = _context.AbsenceRecords
                .Where(a => a.EmployeeId == employeeId && a.Year == year && a.Month == month);

            if (excludeId.HasValue)
            {
                query = query.Where(a => a.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<IEnumerable<AbsenceRecord>> GetAbsenceRecordsByYearMonthAsync(int year, int month)
        {
            return await _context.AbsenceRecords
                .Include(a => a.Employee)
                .Where(a => a.Year == year && a.Month == month)
                .OrderBy(a => a.Employee.LastName)
                .ThenBy(a => a.Employee.FirstName)
                .ToListAsync();
        }

        public async Task<IEnumerable<AbsenceRecord>> GetRecentAbsencesWithEmployeeAsync(int count)
        {
            return await _context.AbsenceRecords
                .Include(a => a.Employee)
                .OrderByDescending(a => a.CreatedAt)
                .Take(count)
                .ToListAsync();
        }
    }
} 