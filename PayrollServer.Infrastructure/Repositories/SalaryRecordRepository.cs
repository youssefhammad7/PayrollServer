using Microsoft.EntityFrameworkCore;
using PayrollServer.Domain.Entities;
using PayrollServer.Domain.Interfaces.Repositories;
using PayrollServer.Infrastructure.Data.Context;
using PayrollServer.Infrastructure.Data.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PayrollServer.Infrastructure.Repositories
{
    public class SalaryRecordRepository : Repository<SalaryRecord>, ISalaryRecordRepository
    {
        public SalaryRecordRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<SalaryRecord>> GetSalaryHistoryForEmployeeAsync(int employeeId)
        {
            return await _context.SalaryRecords
                .Where(s => s.EmployeeId == employeeId)
                .OrderByDescending(s => s.EffectiveDate)
                .ThenByDescending(s => s.CreatedAt)
                .ToListAsync();
        }

        public async Task<SalaryRecord> GetCurrentSalaryForEmployeeAsync(int employeeId)
        {
            return await _context.SalaryRecords
                .Where(s => s.EmployeeId == employeeId)
                .OrderByDescending(s => s.EffectiveDate)
                .ThenByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync();
        }
        
        public async Task<SalaryRecord> GetMostRecentSalaryAsync(int employeeId, DateTime asOfDate)
        {
            return await _context.SalaryRecords
                .Where(s => s.EmployeeId == employeeId && s.EffectiveDate <= asOfDate)
                .OrderByDescending(s => s.EffectiveDate)
                .ThenByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> HasOverlappingEffectiveDateAsync(int employeeId, DateTime effectiveDate, int? excludeId = null)
        {
            var query = _context.SalaryRecords
                .Where(s => s.EmployeeId == employeeId && s.EffectiveDate.Date == effectiveDate.Date);

            if (excludeId.HasValue)
            {
                query = query.Where(s => s.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }
    }
} 