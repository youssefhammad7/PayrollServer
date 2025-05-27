using PayrollServer.Application.DTOs.AbsenceRecord;
using PayrollServer.Application.Features.AbsenceRecord.Requests;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Application.Interfaces.Services
{
    public interface IAbsenceRecordService
    {
        Task<IEnumerable<AbsenceRecordDto>> GetAllAbsenceRecordsAsync(int year, int month);
        
        Task<IEnumerable<AbsenceRecordDto>> GetAbsenceRecordsForEmployeeAsync(int employeeId);
        
        Task<AbsenceRecordDto> GetAbsenceRecordByIdAsync(int id);
        
        Task<AbsenceRecordDto> GetAbsenceRecordForMonthAsync(int employeeId, int year, int month);
        
        Task<AbsenceRecordDto> CreateAbsenceRecordAsync(CreateAbsenceRecordRequest request);
        
        Task<AbsenceRecordDto> UpdateAbsenceRecordAsync(int id, UpdateAbsenceRecordRequest request);
        
        Task<bool> DeleteAbsenceRecordAsync(int id);
    }
} 