using PayrollServer.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Domain.Interfaces.Repositories
{
    public interface IEmployeeRepository : IRepository<Employee>
    {
        Task<IEnumerable<Employee>> GetEmployeesWithDetailsAsync(int page, int pageSize, string? searchTerm = null, int? departmentId = null, int? jobGradeId = null);
        
        Task<Employee> GetEmployeeWithDetailsAsync(int id);
        
        Task<Employee> GetEmployeeByEmployeeNumberAsync(string employeeNumber);
        
        Task<bool> IsDuplicateEmailAsync(string email, int? excludeId = null);
        
        Task<Employee> GetDeletedEmployeeByIdAsync(int id);
        
        Task<int> GetTotalCountAsync(string? searchTerm = null, int? departmentId = null, int? jobGradeId = null);
        
        Task<IEnumerable<Employee>> GetAllWithDetailsAsync();
        
        Task<Employee> GetByIdWithDetailsAsync(int id);
        
        Task<IEnumerable<Employee>> GetByDepartmentAsync(int departmentId);
        
        Task<IEnumerable<Employee>> GetByJobGradeAsync(int jobGradeId);
        
        Task<IEnumerable<Employee>> GetAllActiveEmployeesAsync();
        
        Task<bool> IsEmployeeNumberUniqueAsync(string employeeNumber, int? excludeId = null);
    }
} 