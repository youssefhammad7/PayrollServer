using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PayrollServer.Application.Constants;
using PayrollServer.Application.DTOs.Department;
using PayrollServer.Application.DTOs.Response;
using PayrollServer.Application.Features.Department.Requests;
using PayrollServer.Application.Interfaces.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DepartmentsController : ControllerBase
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
        [Authorize(Roles = Roles.Admin + "," + Roles.HrClerk + "," + Roles.ReadOnly)]
        public async Task<ActionResult<IEnumerable<DepartmentDto>>> GetAll()
        {
            var departments = await _departmentService.GetAllDepartmentsAsync();
            return Ok(departments);
        }

        /// <summary>
        /// Get department by ID
        /// </summary>
        /// <param name="id">Department ID</param>
        /// <returns>Department details</returns>
        [HttpGet("{id}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HrClerk + "," + Roles.ReadOnly)]
        public async Task<ActionResult<DepartmentDto>> GetById(int id)
        {
            var department = await _departmentService.GetDepartmentByIdAsync(id);
            return Ok(department);
        }

        /// <summary>
        /// Create a new department
        /// </summary>
        /// <param name="request">Department details</param>
        /// <returns>Newly created department</returns>
        [HttpPost]
        [Authorize(Roles = Roles.Admin + "," + Roles.HrClerk)]
        public async Task<ActionResult<ApiResponse<DepartmentDto>>> Create([FromBody] CreateDepartmentRequest request)
        {
            var response = await _departmentService.CreateDepartmentAsync(request);
            
            if (!response.Success)
            {
                return BadRequest(response);
            }
            
            return CreatedAtAction(nameof(GetById), new { id = response.Data.Id }, response);
        }

        /// <summary>
        /// Update an existing department
        /// </summary>
        /// <param name="id">Department ID</param>
        /// <param name="request">Updated department details</param>
        /// <returns>Updated department</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HrClerk)]
        public async Task<ActionResult<ApiResponse<DepartmentDto>>> Update(int id, [FromBody] UpdateDepartmentRequest request)
        {
            var response = await _departmentService.UpdateDepartmentAsync(id, request);
            
            if (!response.Success)
            {
                return BadRequest(response);
            }
            
            return Ok(response);
        }

        /// <summary>
        /// Delete a department
        /// </summary>
        /// <param name="id">Department ID</param>
        /// <returns>Success status</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            var response = await _departmentService.DeleteDepartmentAsync(id);
            
            if (!response.Success)
            {
                return BadRequest(response);
            }
            
            return Ok(response);
        }

        /// <summary>
        /// Update department incentive percentage
        /// </summary>
        /// <param name="id">Department ID</param>
        /// <param name="request">Incentive details</param>
        /// <returns>Updated department</returns>
        [HttpPatch("{id}/incentive")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<ActionResult<ApiResponse<DepartmentDto>>> UpdateIncentive(int id, [FromBody] UpdateDepartmentIncentiveRequest request)
        {
            var response = await _departmentService.UpdateDepartmentIncentiveAsync(id, request);
            
            if (!response.Success)
            {
                return BadRequest(response);
            }
            
            return Ok(response);
        }

        /// <summary>
        /// Get department incentive history
        /// </summary>
        /// <param name="id">Department ID</param>
        /// <returns>List of incentive history records</returns>
        [HttpGet("{id}/incentive-history")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HrClerk)]
        public async Task<ActionResult<IEnumerable<DepartmentIncentiveHistoryDto>>> GetIncentiveHistory(int id)
        {
            var history = await _departmentService.GetDepartmentIncentiveHistoryAsync(id);
            return Ok(history);
        }
    }
} 