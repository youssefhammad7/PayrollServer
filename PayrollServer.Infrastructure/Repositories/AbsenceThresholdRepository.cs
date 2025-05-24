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
    public class AbsenceThresholdRepository : Repository<AbsenceThreshold>, IAbsenceThresholdRepository
    {
        public AbsenceThresholdRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<AbsenceThreshold>> GetActiveThresholdsAsync()
        {
            return await _dbSet
                .Where(t => t.IsActive)
                .OrderBy(t => t.MinAbsenceDays)
                .ToListAsync();
        }

        public async Task<AbsenceThreshold> GetThresholdForAbsenceDaysAsync(int absenceDays)
        {
            return await _dbSet
                .Where(t => t.IsActive &&
                       absenceDays >= t.MinAbsenceDays &&
                       (!t.MaxAbsenceDays.HasValue || absenceDays <= t.MaxAbsenceDays.Value))
                .FirstOrDefaultAsync();
        }

        public async Task<bool> CheckForOverlappingThresholdsAsync(int minDays, int? maxDays, int? excludeId = null)
        {
            var query = _dbSet.Where(t => t.IsActive);
            
            if (excludeId.HasValue)
            {
                query = query.Where(t => t.Id != excludeId.Value);
            }

            // Thresholds with no max value (unlimited upper range)
            var unlimitedThresholds = await query
                .Where(t => !t.MaxAbsenceDays.HasValue)
                .ToListAsync();

            // If our new threshold is unlimited and there are other unlimited thresholds
            if (!maxDays.HasValue && unlimitedThresholds.Any())
            {
                return true; // Overlapping detected with unlimited thresholds
            }

            // For unlimited thresholds, check if any existing unlimited threshold's min <= our max (if we have a max)
            if (maxDays.HasValue)
            {
                foreach (var threshold in unlimitedThresholds)
                {
                    if (threshold.MinAbsenceDays <= maxDays.Value)
                    {
                        return true; // Overlapping detected with unlimited threshold
                    }
                }
            }

            // For thresholds with defined ranges
            var overlappingThresholds = await query
                .Where(t => t.MaxAbsenceDays.HasValue && 
                       ((minDays <= t.MaxAbsenceDays.Value && t.MinAbsenceDays <= (maxDays ?? int.MaxValue))))
                .AnyAsync();

            return overlappingThresholds;
        }

        public async Task<bool> IsDuplicateNameAsync(string name, int? excludeId = null)
        {
            var query = _dbSet.Where(t => t.Name == name && t.IsActive);
            
            if (excludeId.HasValue)
            {
                query = query.Where(t => t.Id != excludeId.Value);
            }
            
            return await query.AnyAsync();
        }
    }
} 