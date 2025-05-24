using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PayrollServer.Application.DTOs.JobGrade;
using PayrollServer.Application.Features.JobGrade.Requests;
using PayrollServer.Application.Interfaces.Services;
using PayrollServer.Extensions;
using PayrollServer.Infrastructure.Identity.Constants;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Controllers
{
    [Authorize]
    public class JobGradesController : BaseApiController
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
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var jobGrades = await _jobGradeService.GetAllJobGradesAsync();
                return this.ApiOk(jobGrades);
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Get job grade by ID
        /// </summary>
        /// <param name="id">Job grade ID</param>
        /// <returns>Job grade details</returns>
        [HttpGet("{id}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var jobGrade = await _jobGradeService.GetJobGradeByIdAsync(id);
                return this.ApiOk(jobGrade);
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Job grade not found");
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Create a new job grade
        /// </summary>
        /// <param name="request">Job grade details</param>
        /// <returns>Newly created job grade</returns>
        [HttpPost]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> Create([FromBody] CreateJobGradeRequest request)
        {
            try
            {
                var jobGrade = await _jobGradeService.CreateJobGradeAsync(request);
                return this.ApiCreated(jobGrade, "Job grade created successfully");
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
        /// Update an existing job grade
        /// </summary>
        /// <param name="id">Job grade ID</param>
        /// <param name="request">Updated job grade details</param>
        /// <returns>Updated job grade</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateJobGradeRequest request)
        {
            try
            {
                var jobGrade = await _jobGradeService.UpdateJobGradeAsync(id, request);
                return this.ApiOk(jobGrade, "Job grade updated successfully");
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Job grade not found");
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
        /// Delete a job grade
        /// </summary>
        /// <param name="id">Job grade ID</param>
        /// <returns>Success status</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _jobGradeService.DeleteJobGradeAsync(id);
                return this.ApiOk("Job grade deleted successfully");
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Job grade not found");
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