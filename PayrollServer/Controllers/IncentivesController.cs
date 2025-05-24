using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PayrollServer.Application.DTOs.Incentive;
using PayrollServer.Application.Features.Incentive.Requests;
using PayrollServer.Application.Interfaces.Services;
using PayrollServer.Extensions;
using PayrollServer.Infrastructure.Identity.Constants;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PayrollServer.Controllers
{
    //[Authorize]
    public class IncentivesController : BaseApiController
    {
        private readonly IIncentiveService _incentiveService;

        public IncentivesController(IIncentiveService incentiveService)
        {
            _incentiveService = incentiveService;
        }

        /// <summary>
        /// Get all incentives with optional filtering by employee ID
        /// </summary>
        /// <param name="employeeId">Optional employee ID to filter records</param>
        /// <returns>List of incentives</returns>
        [HttpGet]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetAll([FromQuery] int? employeeId = null)
        {
            try
            {
                var incentives = await _incentiveService.GetAllIncentivesAsync(employeeId);
                return this.ApiOk(incentives);
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Get incentive by ID
        /// </summary>
        /// <param name="id">Incentive ID</param>
        /// <returns>Incentive details</returns>
        [HttpGet("{id}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var incentive = await _incentiveService.GetIncentiveByIdAsync(id);
                return this.ApiOk(incentive);
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Incentive not found");
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Get incentives for an employee
        /// </summary>
        /// <param name="employeeId">Employee ID</param>
        /// <returns>List of incentives for the employee</returns>
        [HttpGet("employee/{employeeId}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetIncentivesForEmployee(int employeeId)
        {
            try
            {
                var incentives = await _incentiveService.GetIncentivesForEmployeeAsync(employeeId);
                return this.ApiOk(incentives);
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
        /// Get incentives by date range
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <param name="employeeId">Optional employee ID to filter records</param>
        /// <returns>List of incentives within the date range</returns>
        [HttpGet("date-range")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetIncentivesByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] int? employeeId = null)
        {
            try
            {
                var incentives = await _incentiveService.GetIncentivesByDateRangeAsync(startDate, endDate, employeeId);
                return this.ApiOk(incentives);
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Employee not found");
            }
            catch (Domain.Exceptions.BusinessRuleViolationException ex)
            {
                return this.ApiBadRequest(ex.Message);
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Create a new incentive
        /// </summary>
        /// <param name="request">Incentive details</param>
        /// <returns>Newly created incentive</returns>
        [HttpPost]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk)]
        public async Task<IActionResult> Create([FromBody] CreateIncentiveRequest request)
        {
            try
            {
                var incentive = await _incentiveService.CreateIncentiveAsync(request);
                return this.ApiCreated(incentive, "Incentive created successfully");
            }
            catch (FluentValidation.ValidationException ex)
            {
                return this.ApiBadRequest(ex.Errors.Select(e => e.ErrorMessage));
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
        /// Update an existing incentive
        /// </summary>
        /// <param name="id">Incentive ID</param>
        /// <param name="request">Updated incentive details</param>
        /// <returns>Updated incentive</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateIncentiveRequest request)
        {
            try
            {
                var incentive = await _incentiveService.UpdateIncentiveAsync(id, request);
                return this.ApiOk(incentive, "Incentive updated successfully");
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Incentive not found");
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
        /// Delete an incentive
        /// </summary>
        /// <param name="id">Incentive ID</param>
        /// <returns>Success status</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _incentiveService.DeleteIncentiveAsync(id);
                return this.ApiOk("Incentive deleted successfully");
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Incentive not found");
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