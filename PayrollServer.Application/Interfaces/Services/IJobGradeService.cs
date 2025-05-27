using PayrollServer.Application.DTOs.JobGrade;
using PayrollServer.Application.Features.JobGrade.Requests;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Application.Interfaces.Services
{
    public interface IJobGradeService
    {
        Task<IEnumerable<JobGradeDto>> GetAllJobGradesAsync();
        Task<JobGradeDto> GetJobGradeByIdAsync(int id);
        Task<JobGradeDto> CreateJobGradeAsync(CreateJobGradeRequest request);
        Task<JobGradeDto> UpdateJobGradeAsync(int id, UpdateJobGradeRequest request);
        Task<bool> DeleteJobGradeAsync(int id);
    }
} 