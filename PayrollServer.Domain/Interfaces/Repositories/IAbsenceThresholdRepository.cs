using PayrollServer.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Domain.Interfaces.Repositories
{
    public interface IAbsenceThresholdRepository : IRepository<AbsenceThreshold>
    {
        Task<IEnumerable<AbsenceThreshold>> GetActiveThresholdsAsync();
        
        Task<AbsenceThreshold> GetThresholdForAbsenceDaysAsync(int absenceDays);
        
        Task<bool> CheckForOverlappingThresholdsAsync(int minDays, int? maxDays, int? excludeId = null);
        
        Task<bool> IsDuplicateNameAsync(string name, int? excludeId = null);
    }
} 