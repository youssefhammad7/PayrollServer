using PayrollServer.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Domain.Interfaces.Repositories
{
    public interface IAbsenceRecordRepository : IRepository<AbsenceRecord>
    {
        Task<IEnumerable<AbsenceRecord>> GetAbsenceRecordsForEmployeeAsync(int employeeId);
        
        Task<AbsenceRecord> GetAbsenceRecordForMonthAsync(int employeeId, int year, int month);
        
        Task<bool> IsDuplicateMonthAsync(int employeeId, int year, int month, int? excludeId = null);
        
        Task<IEnumerable<AbsenceRecord>> GetAbsenceRecordsByYearMonthAsync(int year, int month);
    }
} 