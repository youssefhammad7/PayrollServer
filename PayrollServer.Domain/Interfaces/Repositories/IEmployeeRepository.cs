using PayrollServer.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Domain.Interfaces.Repositories
{
    public interface IEmployeeRepository : IRepository<Employee>
    {
        Task<IEnumerable<Employee>> GetEmployeesWithDetailsAsync(int page, int pageSize, string? searchTerm = null, int? departmentId = null, int? jobGradeId = null);
        
        Task<Employee> GetEmployeeWithDetailsAsync(int id);
        
        Task<Employee> GetEmployeeByEmployeeIdAsync(string employeeId);
        
        Task<bool> IsDuplicateEmailAsync(string email, int? excludeId = null);
        
        Task<Employee> GetDeletedEmployeeByIdAsync(int id);
        
        Task<int> GetTotalCountAsync(string? searchTerm = null, int? departmentId = null, int? jobGradeId = null);
    }
} 