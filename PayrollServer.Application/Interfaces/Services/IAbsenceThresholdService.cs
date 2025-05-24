using PayrollServer.Application.DTOs.AbsenceThreshold;
using PayrollServer.Application.Features.AbsenceThreshold.Requests;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Application.Interfaces.Services
{
    public interface IAbsenceThresholdService
    {
        Task<IEnumerable<AbsenceThresholdDto>> GetAllAbsenceThresholdsAsync(bool activeOnly = false);
        
        Task<AbsenceThresholdDto> GetAbsenceThresholdByIdAsync(int id);
        
        Task<AbsenceThresholdDto> GetThresholdForAbsenceDaysAsync(int absenceDays);
        
        Task<AbsenceThresholdDto> CreateAbsenceThresholdAsync(CreateAbsenceThresholdRequest request);
        
        Task<AbsenceThresholdDto> UpdateAbsenceThresholdAsync(int id, UpdateAbsenceThresholdRequest request);
        
        Task<bool> DeleteAbsenceThresholdAsync(int id);
        
        Task<bool> CheckForOverlappingThresholdsAsync(int minDays, int? maxDays, int? excludeId = null);
    }
} 