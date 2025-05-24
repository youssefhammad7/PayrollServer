using PayrollServer.Domain.Entities;
using System.Threading.Tasks;

namespace PayrollServer.Domain.Interfaces.Repositories
{
    public interface IJobGradeRepository : IRepository<JobGrade>
    {
        Task<JobGrade?> GetByNameAsync(string name);
        Task<bool> HasEmployeesAsync(int jobGradeId);
        Task<bool> IsDuplicateNameAsync(string name, int? excludeId = null);
    }
} 