using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PayrollServer.Application.DTOs.Employee;
using PayrollServer.Application.Features.Employee.Requests;
using PayrollServer.Application.Interfaces.Services;
using PayrollServer.Extensions;
using PayrollServer.Infrastructure.Identity.Constants;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Controllers
{
    [Authorize]
    public class EmployeesController : BaseApiController
    {
        private readonly IEmployeeService _employeeService;

        public EmployeesController(IEmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

        /// <summary>
        /// Get all employees with optional filtering
        /// </summary>
        /// <param name="page">Page number</param>
        /// <param name="pageSize">Items per page</param>
        /// <param name="searchTerm">Search term for name, email, or employee ID</param>
        /// <param name="departmentId">Filter by department ID</param>
        /// <param name="jobGradeId">Filter by job grade ID</param>
        /// <returns>List of employees</returns>
        [HttpGet]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10, 
            [FromQuery] string searchTerm = null, 
            [FromQuery] int? departmentId = null, 
            [FromQuery] int? jobGradeId = null)
        {
            try
            {
                var employees = await _employeeService.GetAllEmployeesAsync(page, pageSize, searchTerm, departmentId, jobGradeId);
                var totalCount = await _employeeService.GetTotalEmployeesCountAsync(searchTerm, departmentId, jobGradeId);
                
                var result = new
                {
                    Items = employees,
                    TotalCount = totalCount,
                    PageNumber = page,
                    PageSize = pageSize,
                    TotalPages = (totalCount + pageSize - 1) / pageSize
                };
                
                return this.ApiOk(result);
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Get employee by ID
        /// </summary>
        /// <param name="id">Employee ID</param>
        /// <returns>Employee details</returns>
        [HttpGet("{id}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var employee = await _employeeService.GetEmployeeByIdAsync(id);
                return this.ApiOk(employee);
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Employee not found");
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Get employee by employee ID
        /// </summary>
        /// <param name="employeeId">Employee ID string</param>
        /// <returns>Employee details</returns>
        [HttpGet("by-employee-id/{employeeId}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetByEmployeeId(string employeeId)
        {
            try
            {
                var employee = await _employeeService.GetEmployeeByEmployeeIdAsync(employeeId);
                return this.ApiOk(employee);
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Employee not found");
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Create a new employee
        /// </summary>
        /// <param name="request">Employee details</param>
        /// <returns>Created employee</returns>
        [HttpPost]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk)]
        public async Task<IActionResult> Create([FromBody] CreateEmployeeRequest request)
        {
            try
            {
                var employee = await _employeeService.CreateEmployeeAsync(request);
                return this.ApiCreated(employee, "Employee created successfully");
            }
            catch (FluentValidation.ValidationException ex)
            {
                return this.ApiBadRequest(ex.Errors.Select(e => e.ErrorMessage));
            }
            catch (Domain.Exceptions.DomainException ex)
            {
                return this.ApiBadRequest(ex.Message);
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Update an existing employee
        /// </summary>
        /// <param name="id">Employee ID</param>
        /// <param name="request">Updated employee details</param>
        /// <returns>Updated employee</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateEmployeeRequest request)
        {
            try
            {
                var employee = await _employeeService.UpdateEmployeeAsync(id, request);
                return this.ApiOk(employee, "Employee updated successfully");
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Employee not found");
            }
            catch (FluentValidation.ValidationException ex)
            {
                return this.ApiBadRequest(ex.Errors.Select(e => e.ErrorMessage));
            }
            catch (Domain.Exceptions.DomainException ex)
            {
                return this.ApiBadRequest(ex.Message);
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Delete (soft delete) an employee
        /// </summary>
        /// <param name="id">Employee ID</param>
        /// <returns>Success status</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk)]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _employeeService.DeleteEmployeeAsync(id);
                return this.ApiOk("Employee deleted successfully");
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Employee not found");
            }
            catch (Domain.Exceptions.DomainException ex)
            {
                return this.ApiBadRequest(ex.Message);
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Restore a deleted employee
        /// </summary>
        /// <param name="id">Employee ID</param>
        /// <returns>Success status</returns>
        [HttpPost("{id}/restore")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> Restore(int id)
        {
            try
            {
                await _employeeService.RestoreEmployeeAsync(id);
                return this.ApiOk("Employee restored successfully");
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Deleted employee not found");
            }
            catch (Domain.Exceptions.DomainException ex)
            {
                return this.ApiBadRequest(ex.Message);
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }
    }
} 