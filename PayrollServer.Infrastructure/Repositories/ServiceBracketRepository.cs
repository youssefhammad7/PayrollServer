using Microsoft.EntityFrameworkCore;
using PayrollServer.Domain.Entities;
using PayrollServer.Domain.Interfaces.Repositories;
using PayrollServer.Infrastructure.Data.Context;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PayrollServer.Infrastructure.Repositories
{
    public class ServiceBracketRepository : Repository<ServiceBracket>, IServiceBracketRepository
    {
        public ServiceBracketRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<ServiceBracket>> GetActiveServiceBracketsAsync()
        {
            return await _dbSet
                .Where(sb => sb.IsActive)
                .OrderBy(sb => sb.MinYearsOfService)
                .ToListAsync();
        }

        public async Task<ServiceBracket> GetServiceBracketForYearsOfServiceAsync(int yearsOfService)
        {
            return await _dbSet
                .Where(sb => sb.IsActive &&
                       yearsOfService >= sb.MinYearsOfService &&
                       (!sb.MaxYearsOfService.HasValue || yearsOfService <= sb.MaxYearsOfService.Value))
                .FirstOrDefaultAsync();
        }

        public async Task<bool> CheckForOverlappingBracketsAsync(int minYears, int? maxYears, int? excludeId = null)
        {
            var query = _dbSet.Where(sb => sb.IsActive);
            
            if (excludeId.HasValue)
            {
                query = query.Where(sb => sb.Id != excludeId.Value);
            }

            // Brackets with no max value (unlimited upper range)
            var unlimitedBrackets = await query
                .Where(sb => !sb.MaxYearsOfService.HasValue)
                .ToListAsync();

            // If our new bracket is unlimited and there are other unlimited brackets
            if (!maxYears.HasValue && unlimitedBrackets.Any())
            {
                return true; // Overlapping detected with unlimited brackets
            }

            // For unlimited brackets, check if any existing unlimited bracket's min <= our max (if we have a max)
            if (maxYears.HasValue)
            {
                foreach (var bracket in unlimitedBrackets)
                {
                    if (bracket.MinYearsOfService <= maxYears.Value)
                    {
                        return true; // Overlapping detected with unlimited bracket
                    }
                }
            }

            // For brackets with defined ranges
            var overlappingBrackets = await query
                .Where(sb => sb.MaxYearsOfService.HasValue && 
                       ((minYears <= sb.MaxYearsOfService.Value && sb.MinYearsOfService <= (maxYears ?? int.MaxValue))))
                .AnyAsync();

            return overlappingBrackets;
        }

        public async Task<ServiceBracket> GetBracketForYearsOfServiceAsync(int yearsOfService)
        {
            return await GetServiceBracketForYearsOfServiceAsync(yearsOfService);
        }
    }
} 