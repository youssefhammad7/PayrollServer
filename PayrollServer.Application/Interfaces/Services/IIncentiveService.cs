using PayrollServer.Application.DTOs.Incentive;
using PayrollServer.Application.Features.Incentive.Requests;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Application.Interfaces.Services
{
    public interface IIncentiveService
    {
        Task<IEnumerable<IncentiveDto>> GetAllIncentivesAsync(int? employeeId = null);
        
        Task<IncentiveDto> GetIncentiveByIdAsync(int id);
        
        Task<IEnumerable<IncentiveDto>> GetIncentivesForEmployeeAsync(int employeeId);
        
        Task<IEnumerable<IncentiveDto>> GetIncentivesByDateRangeAsync(DateTime startDate, DateTime endDate, int? employeeId = null);
        
        Task<IncentiveDto> CreateIncentiveAsync(CreateIncentiveRequest request);
        
        Task<IncentiveDto> UpdateIncentiveAsync(int id, UpdateIncentiveRequest request);
        
        Task<bool> DeleteIncentiveAsync(int id);
    }
} 