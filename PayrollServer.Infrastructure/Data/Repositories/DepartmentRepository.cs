using Microsoft.EntityFrameworkCore;
using PayrollServer.Domain.Entities;
using PayrollServer.Domain.Interfaces.Repositories;
using PayrollServer.Infrastructure.Data.Context;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PayrollServer.Infrastructure.Data.Repositories
{
    public class DepartmentRepository : Repository<Department>, IDepartmentRepository
    {
        public DepartmentRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<Department?> GetByNameAsync(string name)
        {
            return await _dbSet
                .FirstOrDefaultAsync(d => d.Name == name && !d.IsDeleted);
        }

        public async Task<bool> HasEmployeesAsync(int departmentId)
        {
            return await _context.Set<Employee>()
                .AnyAsync(e => e.DepartmentId == departmentId && !e.IsDeleted);
        }

        public async Task<IEnumerable<DepartmentIncentiveHistory>> GetIncentiveHistoryAsync(int departmentId)
        {
            return await _context.Set<DepartmentIncentiveHistory>()
                .Where(h => h.DepartmentId == departmentId && !h.IsDeleted)
                .OrderByDescending(h => h.EffectiveDate)
                .ToListAsync();
        }

        public async Task<bool> IsDuplicateNameAsync(string name, int? excludeId = null)
        {
            var query = _dbSet.Where(d => d.Name == name && !d.IsDeleted);
            
            if (excludeId.HasValue)
            {
                query = query.Where(d => d.Id != excludeId.Value);
            }
            
            return await query.AnyAsync();
        }

        // Add eager loading for related entities
        public override async Task<Department> GetByIdAsync(int id)
        {
            var department = await _dbSet
                .Include(d => d.IncentiveHistories.Where(h => !h.IsDeleted))
                .FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted);
                
            return department ?? throw new Domain.Exceptions.EntityNotFoundException(typeof(Department).Name, id.ToString());
        }

        public override async Task<IEnumerable<Department>> GetAllAsync()
        {
            return await _dbSet
                .Where(d => !d.IsDeleted)
                .OrderBy(d => d.Name)
                .ToListAsync();
        }
    }
} 