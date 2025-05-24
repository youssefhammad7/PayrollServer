using PayrollServer.Application.DTOs.Department;
using PayrollServer.Application.Features.Department.Requests;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Application.Interfaces.Services
{
    public interface IDepartmentService
    {
        Task<IEnumerable<DepartmentDto>> GetAllDepartmentsAsync();
        Task<DepartmentDto> GetDepartmentByIdAsync(int id);
        Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentRequest request);
        Task<DepartmentDto> UpdateDepartmentAsync(int id, UpdateDepartmentRequest request);
        Task<bool> DeleteDepartmentAsync(int id);
        Task<DepartmentDto> UpdateDepartmentIncentiveAsync(int id, UpdateDepartmentIncentiveRequest request);
        Task<IEnumerable<DepartmentIncentiveHistoryDto>> GetDepartmentIncentiveHistoryAsync(int departmentId);
    }
} 