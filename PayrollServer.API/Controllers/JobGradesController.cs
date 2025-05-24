using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PayrollServer.Application.Constants;
using PayrollServer.Application.DTOs.JobGrade;
using PayrollServer.Application.DTOs.Response;
using PayrollServer.Application.Features.JobGrade.Requests;
using PayrollServer.Application.Interfaces.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class JobGradesController : ControllerBase
    {
        private readonly IJobGradeService _jobGradeService;

        public JobGradesController(IJobGradeService jobGradeService)
        {
            _jobGradeService = jobGradeService;
        }

        /// <summary>
        /// Get all job grades
        /// </summary>
        /// <returns>List of all job grades</returns>
        [HttpGet]
        [Authorize(Roles = Roles.Admin + "," + Roles.HrClerk + "," + Roles.ReadOnly)]
        public async Task<ActionResult<IEnumerable<JobGradeDto>>> GetAll()
        {
            var jobGrades = await _jobGradeService.GetAllJobGradesAsync();
            return Ok(jobGrades);
        }

        /// <summary>
        /// Get job grade by ID
        /// </summary>
        /// <param name="id">Job grade ID</param>
        /// <returns>Job grade details</returns>
        [HttpGet("{id}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HrClerk + "," + Roles.ReadOnly)]
        public async Task<ActionResult<JobGradeDto>> GetById(int id)
        {
            var jobGrade = await _jobGradeService.GetJobGradeByIdAsync(id);
            return Ok(jobGrade);
        }

        /// <summary>
        /// Create a new job grade
        /// </summary>
        /// <param name="request">Job grade details</param>
        /// <returns>Newly created job grade</returns>
        [HttpPost]
        [Authorize(Roles = Roles.Admin)]
        public async Task<ActionResult<ApiResponse<JobGradeDto>>> Create([FromBody] CreateJobGradeRequest request)
        {
            var response = await _jobGradeService.CreateJobGradeAsync(request);
            
            if (!response.Success)
            {
                return BadRequest(response);
            }
            
            return CreatedAtAction(nameof(GetById), new { id = response.Data.Id }, response);
        }

        /// <summary>
        /// Update an existing job grade
        /// </summary>
        /// <param name="id">Job grade ID</param>
        /// <param name="request">Updated job grade details</param>
        /// <returns>Updated job grade</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<ActionResult<ApiResponse<JobGradeDto>>> Update(int id, [FromBody] UpdateJobGradeRequest request)
        {
            var response = await _jobGradeService.UpdateJobGradeAsync(id, request);
            
            if (!response.Success)
            {
                return BadRequest(response);
            }
            
            return Ok(response);
        }

        /// <summary>
        /// Delete a job grade
        /// </summary>
        /// <param name="id">Job grade ID</param>
        /// <returns>Success status</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            var response = await _jobGradeService.DeleteJobGradeAsync(id);
            
            if (!response.Success)
            {
                return BadRequest(response);
            }
            
            return Ok(response);
        }
    }
} 