using PayrollServer.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Domain.Interfaces.Repositories
{
    public interface IIncentiveRepository : IRepository<Incentive>
    {
        Task<IEnumerable<Incentive>> GetIncentivesForEmployeeAsync(int employeeId);
        
        Task<IEnumerable<Incentive>> GetIncentivesByDateRangeAsync(DateTime startDate, DateTime endDate, int? employeeId = null);
    }
} 