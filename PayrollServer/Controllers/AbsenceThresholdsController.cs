using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PayrollServer.Application.DTOs.AbsenceThreshold;
using PayrollServer.Application.Features.AbsenceThreshold.Requests;
using PayrollServer.Application.Interfaces.Services;
using PayrollServer.Extensions;
using PayrollServer.Infrastructure.Identity.Constants;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Controllers
{
    public class AbsenceThresholdsController : BaseApiController
    {
        private readonly IAbsenceThresholdService _absenceThresholdService;

        public AbsenceThresholdsController(IAbsenceThresholdService absenceThresholdService)
        {
            _absenceThresholdService = absenceThresholdService;
        }

        /// <summary>
        /// Get all absence thresholds
        /// </summary>
        /// <param name="activeOnly">When true, returns only active thresholds</param>
        /// <returns>List of absence thresholds</returns>
        [HttpGet]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetAbsenceThresholds([FromQuery] bool activeOnly = false)
        {
            try
            {
                var thresholds = await _absenceThresholdService.GetAllAbsenceThresholdsAsync(activeOnly);
                return this.ApiOk(thresholds);
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Get absence threshold by ID
        /// </summary>
        /// <param name="id">Threshold ID</param>
        /// <returns>Absence threshold details</returns>
        [HttpGet("{id}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetAbsenceThreshold(int id)
        {
            try
            {
                var threshold = await _absenceThresholdService.GetAbsenceThresholdByIdAsync(id);
                return this.ApiOk(threshold);
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Absence threshold not found");
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Get appropriate threshold for a specific number of absence days
        /// </summary>
        /// <param name="absenceDays">Number of absence days</param>
        /// <returns>Matching absence threshold</returns>
        [HttpGet("days/{absenceDays}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetThresholdForAbsenceDays(int absenceDays)
        {
            try
            {
                var threshold = await _absenceThresholdService.GetThresholdForAbsenceDaysAsync(absenceDays);
                return this.ApiOk(threshold);
            }
            catch (Domain.Exceptions.BusinessRuleViolationException ex)
            {
                return this.ApiNotFound(ex.Message);
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Create a new absence threshold
        /// </summary>
        /// <param name="request">Threshold details</param>
        /// <returns>Newly created threshold</returns>
        [HttpPost]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> CreateAbsenceThreshold([FromBody] CreateAbsenceThresholdRequest request)
        {
            try
            {
                var threshold = await _absenceThresholdService.CreateAbsenceThresholdAsync(request);
                return this.ApiCreated(threshold, "Absence threshold created successfully");
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
        /// Update an existing absence threshold
        /// </summary>
        /// <param name="id">Threshold ID</param>
        /// <param name="request">Updated threshold details</param>
        /// <returns>Updated threshold</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> UpdateAbsenceThreshold(int id, [FromBody] UpdateAbsenceThresholdRequest request)
        {
            try
            {
                var threshold = await _absenceThresholdService.UpdateAbsenceThresholdAsync(id, request);
                return this.ApiOk(threshold, "Absence threshold updated successfully");
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Absence threshold not found");
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
        /// Delete (deactivate) an absence threshold
        /// </summary>
        /// <param name="id">Threshold ID</param>
        /// <returns>Success status</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> DeleteAbsenceThreshold(int id)
        {
            try
            {
                await _absenceThresholdService.DeleteAbsenceThresholdAsync(id);
                return this.ApiOk("Absence threshold deleted successfully");
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Absence threshold not found");
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
        /// Check if a threshold range overlaps with existing thresholds
        /// </summary>
        /// <param name="minDays">Minimum days</param>
        /// <param name="maxDays">Maximum days (optional)</param>
        /// <param name="excludeId">Threshold ID to exclude from comparison (for updates)</param>
        /// <returns>True if there are overlaps, false otherwise</returns>
        [HttpGet("check-overlap")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> CheckForOverlappingThresholds(
            [FromQuery] int minDays, 
            [FromQuery] int? maxDays = null, 
            [FromQuery] int? excludeId = null)
        {
            try
            {
                var result = await _absenceThresholdService.CheckForOverlappingThresholdsAsync(minDays, maxDays, excludeId);
                return this.ApiOk(result);
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }
    }
} 