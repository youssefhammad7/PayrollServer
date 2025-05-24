using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PayrollServer.Application.DTOs.AbsenceRecord;
using PayrollServer.Application.Features.AbsenceRecord.Requests;
using PayrollServer.Application.Interfaces.Services;
using PayrollServer.Extensions;
using PayrollServer.Infrastructure.Identity.Constants;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Controllers
{
    public class AbsenceRecordsController : BaseApiController
    {
        private readonly IAbsenceRecordService _absenceRecordService;

        public AbsenceRecordsController(IAbsenceRecordService absenceRecordService)
        {
            _absenceRecordService = absenceRecordService;
        }

        /// <summary>
        /// Get absence records for a specific year and month
        /// </summary>
        /// <param name="year">Year</param>
        /// <param name="month">Month (1-12)</param>
        /// <returns>List of absence records</returns>
        [HttpGet]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetAbsenceRecords([FromQuery] int year, [FromQuery] int month)
        {
            try
            {
                var records = await _absenceRecordService.GetAllAbsenceRecordsAsync(year, month);
                return this.ApiOk(records);
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Get absence records for a specific employee
        /// </summary>
        /// <param name="employeeId">Employee ID</param>
        /// <returns>List of employee's absence records</returns>
        [HttpGet("employee/{employeeId}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetAbsenceRecordsForEmployee(int employeeId)
        {
            try
            {
                var records = await _absenceRecordService.GetAbsenceRecordsForEmployeeAsync(employeeId);
                return this.ApiOk(records);
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Get absence record by ID
        /// </summary>
        /// <param name="id">Absence record ID</param>
        /// <returns>Absence record details</returns>
        [HttpGet("{id}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetAbsenceRecord(int id)
        {
            try
            {
                var record = await _absenceRecordService.GetAbsenceRecordByIdAsync(id);
                return this.ApiOk(record);
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Absence record not found");
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Get absence record for a specific employee, year, and month
        /// </summary>
        /// <param name="employeeId">Employee ID</param>
        /// <param name="year">Year</param>
        /// <param name="month">Month (1-12)</param>
        /// <returns>Absence record details</returns>
        [HttpGet("employee/{employeeId}/year/{year}/month/{month}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetAbsenceRecordForMonth(int employeeId, int year, int month)
        {
            try
            {
                var record = await _absenceRecordService.GetAbsenceRecordForMonthAsync(employeeId, year, month);
                return this.ApiOk(record);
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Absence record not found");
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Create a new absence record
        /// </summary>
        /// <param name="request">Absence record details</param>
        /// <returns>Newly created absence record</returns>
        [HttpPost]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk)]
        public async Task<IActionResult> CreateAbsenceRecord([FromBody] CreateAbsenceRecordRequest request)
        {
            try
            {
                var record = await _absenceRecordService.CreateAbsenceRecordAsync(request);
                return this.ApiCreated(record, "Absence record created successfully");
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
        /// Update an existing absence record
        /// </summary>
        /// <param name="id">Absence record ID</param>
        /// <param name="request">Updated absence record details</param>
        /// <returns>Updated absence record</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk)]
        public async Task<IActionResult> UpdateAbsenceRecord(int id, [FromBody] UpdateAbsenceRecordRequest request)
        {
            try
            {
                var record = await _absenceRecordService.UpdateAbsenceRecordAsync(id, request);
                return this.ApiOk(record, "Absence record updated successfully");
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Absence record not found");
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
        /// Delete an absence record
        /// </summary>
        /// <param name="id">Absence record ID</param>
        /// <returns>Success status</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> DeleteAbsenceRecord(int id)
        {
            try
            {
                await _absenceRecordService.DeleteAbsenceRecordAsync(id);
                return this.ApiOk("Absence record deleted successfully");
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Absence record not found");
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