using PayrollServer.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Domain.Interfaces.Repositories
{
    public interface IServiceBracketRepository : IRepository<ServiceBracket>
    {
        Task<IEnumerable<ServiceBracket>> GetActiveServiceBracketsAsync();
        
        Task<ServiceBracket> GetServiceBracketForYearsOfServiceAsync(int yearsOfService);
        
        Task<bool> CheckForOverlappingBracketsAsync(int minYears, int? maxYears, int? excludeId = null);

        Task<ServiceBracket> GetBracketForYearsOfServiceAsync(int yearsOfService);
    }
} 