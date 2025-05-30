using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PayrollServer.Application.DTOs.ServiceBracket;
using PayrollServer.Application.Features.ServiceBracket.Requests;
using PayrollServer.Application.Interfaces.Services;
using PayrollServer.Extensions;
using PayrollServer.Infrastructure.Identity.Constants;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PayrollServer.Controllers
{
    [Authorize]
    public class ServiceBracketsController : BaseApiController
    {
        private readonly IServiceBracketService _serviceBracketService;

        public ServiceBracketsController(IServiceBracketService serviceBracketService)
        {
            _serviceBracketService = serviceBracketService;
        }

        /// <summary>
        /// Get all service brackets with optional filtering by active status
        /// </summary>
        /// <param name="activeOnly">If true, only return active brackets</param>
        /// <returns>List of service brackets</returns>
        [HttpGet]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetAll([FromQuery] bool activeOnly = false)
        {
            try
            {
                var brackets = await _serviceBracketService.GetAllServiceBracketsAsync(activeOnly);
                return this.ApiOk(brackets);
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Get service bracket by ID
        /// </summary>
        /// <param name="id">Service bracket ID</param>
        /// <returns>Service bracket details</returns>
        [HttpGet("{id}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var bracket = await _serviceBracketService.GetServiceBracketByIdAsync(id);
                return this.ApiOk(bracket);
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Service bracket not found");
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Get service bracket for a specific years of service
        /// </summary>
        /// <param name="years">Years of service</param>
        /// <returns>Matching service bracket</returns>
        [HttpGet("years/{years}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetForYearsOfService(int years)
        {
            try
            {
                var bracket = await _serviceBracketService.GetServiceBracketForYearsOfServiceAsync(years);
                return this.ApiOk(bracket);
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
        /// Create a new service bracket
        /// </summary>
        /// <param name="request">Service bracket details</param>
        /// <returns>Newly created service bracket</returns>
        [HttpPost]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> Create([FromBody] CreateServiceBracketRequest request)
        {
            try
            {
                var bracket = await _serviceBracketService.CreateServiceBracketAsync(request);
                return this.ApiCreated(bracket, "Service bracket created successfully");
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
        /// Update an existing service bracket
        /// </summary>
        /// <param name="id">Service bracket ID</param>
        /// <param name="request">Updated service bracket details</param>
        /// <returns>Updated service bracket</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateServiceBracketRequest request)
        {
            try
            {
                var bracket = await _serviceBracketService.UpdateServiceBracketAsync(id, request);
                return this.ApiOk(bracket, "Service bracket updated successfully");
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Service bracket not found");
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
        /// Delete a service bracket (soft delete by marking as inactive)
        /// </summary>
        /// <param name="id">Service bracket ID</param>
        /// <returns>Success status</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _serviceBracketService.DeleteServiceBracketAsync(id);
                return this.ApiOk("Service bracket deleted successfully");
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Service bracket not found");
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
        /// Check if given service year range overlaps with existing brackets
        /// </summary>
        /// <param name="minYears">Minimum years of service</param>
        /// <param name="maxYears">Maximum years of service (optional)</param>
        /// <param name="excludeId">ID to exclude from overlap check (for updates)</param>
        /// <returns>True if overlapping, false otherwise</returns>
        [HttpGet("check-overlap")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> CheckOverlap([FromQuery] int minYears, [FromQuery] int? maxYears = null, [FromQuery] int? excludeId = null)
        {
            try
            {
                var hasOverlap = await _serviceBracketService.CheckForOverlappingBracketsAsync(minYears, maxYears, excludeId);
                return this.ApiOk(new { hasOverlap });
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }
    }
} 