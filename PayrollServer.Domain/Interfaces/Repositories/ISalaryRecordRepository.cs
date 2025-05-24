using PayrollServer.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Domain.Interfaces.Repositories
{
    public interface ISalaryRecordRepository : IRepository<SalaryRecord>
    {
        Task<IEnumerable<SalaryRecord>> GetSalaryRecordsForEmployeeAsync(int employeeId);
        
        Task<SalaryRecord> GetCurrentSalaryForEmployeeAsync(int employeeId);
        
        Task<bool> IsDuplicateEffectiveDateAsync(int employeeId, System.DateTime effectiveDate, int? excludeId = null);
    }
} 