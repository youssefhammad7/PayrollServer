using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PayrollServer.Application.DTOs.Department;
using PayrollServer.Application.Features.Department.Requests;
using PayrollServer.Application.Interfaces.Services;
using PayrollServer.Extensions;
using PayrollServer.Infrastructure.Identity.Constants;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Controllers
{
    //[Authorize]
    public class DepartmentsController : BaseApiController
    {
        private readonly IDepartmentService _departmentService;

        public DepartmentsController(IDepartmentService departmentService)
        {
            _departmentService = departmentService;
        }

        /// <summary>
        /// Get all departments
        /// </summary>
        /// <returns>List of all departments</returns>
        [HttpGet]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var departments = await _departmentService.GetAllDepartmentsAsync();
                return this.ApiOk(departments);
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Get department by ID
        /// </summary>
        /// <param name="id">Department ID</param>
        /// <returns>Department details</returns>
        [HttpGet("{id}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var department = await _departmentService.GetDepartmentByIdAsync(id);
                return this.ApiOk(department);
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Department not found");
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Create a new department
        /// </summary>
        /// <param name="request">Department details</param>
        /// <returns>Newly created department</returns>
        [HttpPost]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk)]
        public async Task<IActionResult> Create([FromBody] CreateDepartmentRequest request)
        {
            try
            {
                var department = await _departmentService.CreateDepartmentAsync(request);
                return this.ApiCreated(department, "Department created successfully");
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
        /// Update an existing department
        /// </summary>
        /// <param name="id">Department ID</param>
        /// <param name="request">Updated department details</param>
        /// <returns>Updated department</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateDepartmentRequest request)
        {
            try
            {
                var department = await _departmentService.UpdateDepartmentAsync(id, request);
                return this.ApiOk(department, "Department updated successfully");
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Department not found");
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
        /// Delete a department
        /// </summary>
        /// <param name="id">Department ID</param>
        /// <returns>Success status</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _departmentService.DeleteDepartmentAsync(id);
                return this.ApiOk("Department deleted successfully");
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Department not found");
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
        /// Update department incentive percentage
        /// </summary>
        /// <param name="id">Department ID</param>
        /// <param name="request">Incentive details</param>
        /// <returns>Updated department</returns>
        [HttpPatch("{id}/incentive")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> UpdateIncentive(int id, [FromBody] UpdateDepartmentIncentiveRequest request)
        {
            try
            {
                var department = await _departmentService.UpdateDepartmentIncentiveAsync(id, request);
                return this.ApiOk(department, "Department incentive updated successfully");
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Department not found");
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
        /// Get department incentive history
        /// </summary>
        /// <param name="id">Department ID</param>
        /// <returns>List of incentive history records</returns>
        [HttpGet("{id}/incentive-history")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk)]
        public async Task<IActionResult> GetIncentiveHistory(int id)
        {
            try
            {
                var history = await _departmentService.GetDepartmentIncentiveHistoryAsync(id);
                return this.ApiOk(history);
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Department not found");
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }
    }
} 