using PayrollServer.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Domain.Interfaces.Repositories
{
    public interface ISalaryRecordRepository : IRepository<SalaryRecord>
    {
        Task<IEnumerable<SalaryRecord>> GetSalaryHistoryForEmployeeAsync(int employeeId);
        
        Task<SalaryRecord> GetCurrentSalaryForEmployeeAsync(int employeeId);
        
        Task<SalaryRecord> GetMostRecentSalaryAsync(int employeeId, DateTime asOfDate);
        
        Task<bool> HasOverlappingEffectiveDateAsync(int employeeId, DateTime effectiveDate, int? excludeId = null);
        
        Task<IEnumerable<SalaryRecord>> GetRecentSalaryRecordsWithEmployeeAsync(int count);
    }
} 