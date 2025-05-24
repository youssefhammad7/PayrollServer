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
    public class IncentiveRepository : Repository<Incentive>, IIncentiveRepository
    {
        public IncentiveRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Incentive>> GetIncentivesForEmployeeAsync(int employeeId)
        {
            return await _context.Incentives
                .Where(i => i.EmployeeId == employeeId)
                .OrderByDescending(i => i.Date)
                .ThenByDescending(i => i.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Incentive>> GetIncentivesByDateRangeAsync(DateTime startDate, DateTime endDate, int? employeeId = null)
        {
            var query = _context.Incentives
                .Where(i => i.Date >= startDate.Date && i.Date <= endDate.Date);

            if (employeeId.HasValue)
            {
                query = query.Where(i => i.EmployeeId == employeeId.Value);
            }

            return await query
                .OrderByDescending(i => i.Date)
                .ThenByDescending(i => i.CreatedAt)
                .ToListAsync();
        }
    }
} 