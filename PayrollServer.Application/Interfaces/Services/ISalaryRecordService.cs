using PayrollServer.Application.DTOs.SalaryRecord;
using PayrollServer.Application.Features.SalaryRecord.Requests;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Application.Interfaces.Services
{
    public interface ISalaryRecordService
    {
        Task<IEnumerable<SalaryRecordDto>> GetAllSalaryRecordsAsync(int? employeeId = null);
        
        Task<SalaryRecordDto> GetSalaryRecordByIdAsync(int id);
        
        Task<IEnumerable<SalaryRecordDto>> GetSalaryHistoryForEmployeeAsync(int employeeId);
        
        Task<SalaryRecordDto> GetCurrentSalaryForEmployeeAsync(int employeeId);
        
        Task<SalaryRecordDto> CreateSalaryRecordAsync(CreateSalaryRecordRequest request);
        
        Task<SalaryRecordDto> UpdateSalaryRecordAsync(int id, UpdateSalaryRecordRequest request);
        
        Task<bool> DeleteSalaryRecordAsync(int id);
    }
} 