using PayrollServer.Application.DTOs.ServiceBracket;
using PayrollServer.Application.Features.ServiceBracket.Requests;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Application.Interfaces.Services
{
    public interface IServiceBracketService
    {
        Task<IEnumerable<ServiceBracketDto>> GetAllServiceBracketsAsync(bool activeOnly = false);
        
        Task<ServiceBracketDto> GetServiceBracketByIdAsync(int id);
        
        Task<ServiceBracketDto> GetServiceBracketForYearsOfServiceAsync(int yearsOfService);
        
        Task<ServiceBracketDto> CreateServiceBracketAsync(CreateServiceBracketRequest request);
        
        Task<ServiceBracketDto> UpdateServiceBracketAsync(int id, UpdateServiceBracketRequest request);
        
        Task<bool> DeleteServiceBracketAsync(int id);
        
        Task<bool> CheckForOverlappingBracketsAsync(int minYears, int? maxYears, int? excludeId = null);
    }
} 