using PayrollServer.Application.DTOs.Employee;
using PayrollServer.Application.Features.Employee.Requests;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Application.Interfaces.Services
{
    public interface IEmployeeService
    {
        Task<IEnumerable<EmployeeDto>> GetAllEmployeesAsync(int page = 1, int pageSize = 10, string searchTerm = null, int? departmentId = null, int? jobGradeId = null);
        
        Task<EmployeeDto> GetEmployeeByIdAsync(int id);
        
        Task<EmployeeDto> GetEmployeeByEmployeeIdAsync(string employeeId);
        
        Task<EmployeeDto> CreateEmployeeAsync(CreateEmployeeRequest request);
        
        Task<EmployeeDto> UpdateEmployeeAsync(int id, UpdateEmployeeRequest request);
        
        Task<bool> DeleteEmployeeAsync(int id);
        
        Task<bool> RestoreEmployeeAsync(int id);
        
        Task<int> GetTotalEmployeesCountAsync(string searchTerm = null, int? departmentId = null, int? jobGradeId = null);
    }
} 