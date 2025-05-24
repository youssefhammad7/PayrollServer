using Microsoft.EntityFrameworkCore;
using PayrollServer.Domain.Entities;
using PayrollServer.Domain.Interfaces.Repositories;
using PayrollServer.Infrastructure.Data.Context;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PayrollServer.Infrastructure.Data.Repositories
{
    public class JobGradeRepository : Repository<JobGrade>, IJobGradeRepository
    {
        public JobGradeRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<JobGrade?> GetByNameAsync(string name)
        {
            return await _dbSet
                .FirstOrDefaultAsync(j => j.Name == name && !j.IsDeleted);
        }

        public async Task<bool> HasEmployeesAsync(int jobGradeId)
        {
            return await _context.Set<Employee>()
                .AnyAsync(e => e.JobGradeId == jobGradeId && !e.IsDeleted);
        }

        public async Task<bool> IsDuplicateNameAsync(string name, int? excludeId = null)
        {
            var query = _dbSet.Where(j => j.Name == name && !j.IsDeleted);
            
            if (excludeId.HasValue)
            {
                query = query.Where(j => j.Id != excludeId.Value);
            }
            
            return await query.AnyAsync();
        }

        // Override base methods to add filtering and ordering
        public override async Task<IEnumerable<JobGrade>> GetAllAsync()
        {
            return await _dbSet
                .Where(j => !j.IsDeleted)
                .OrderBy(j => j.Name)
                .ToListAsync();
        }
    }
} 