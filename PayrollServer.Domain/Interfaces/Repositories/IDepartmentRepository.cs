using PayrollServer.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Domain.Interfaces.Repositories
{
    public interface IDepartmentRepository : IRepository<Department>
    {
        Task<Department?> GetByNameAsync(string name);
        Task<bool> HasEmployeesAsync(int departmentId);
        Task<IEnumerable<DepartmentIncentiveHistory>> GetIncentiveHistoryAsync(int departmentId);
        Task<bool> IsDuplicateNameAsync(string name, int? excludeId = null);
    }
} 