using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PayrollServer.Application.DTOs.SalaryRecord;
using PayrollServer.Application.Features.SalaryRecord.Requests;
using PayrollServer.Application.Interfaces.Services;
using PayrollServer.Extensions;
using PayrollServer.Infrastructure.Identity.Constants;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PayrollServer.Controllers
{
    //[Authorize]
    public class SalaryRecordsController : BaseApiController
    {
        private readonly ISalaryRecordService _salaryRecordService;

        public SalaryRecordsController(ISalaryRecordService salaryRecordService)
        {
            _salaryRecordService = salaryRecordService;
        }

        /// <summary>
        /// Get all salary records with optional filtering by employee ID
        /// </summary>
        /// <param name="employeeId">Optional employee ID to filter records</param>
        /// <returns>List of salary records</returns>
        [HttpGet]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetAll([FromQuery] int? employeeId = null)
        {
            try
            {
                var salaryRecords = await _salaryRecordService.GetAllSalaryRecordsAsync(employeeId);
                return this.ApiOk(salaryRecords);
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Get salary record by ID
        /// </summary>
        /// <param name="id">Salary record ID</param>
        /// <returns>Salary record details</returns>
        [HttpGet("{id}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var salaryRecord = await _salaryRecordService.GetSalaryRecordByIdAsync(id);
                return this.ApiOk(salaryRecord);
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Salary record not found");
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Get salary history for an employee
        /// </summary>
        /// <param name="employeeId">Employee ID</param>
        /// <returns>List of salary records for the employee</returns>
        [HttpGet("employee/{employeeId}/history")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetSalaryHistory(int employeeId)
        {
            try
            {
                var salaryHistory = await _salaryRecordService.GetSalaryHistoryForEmployeeAsync(employeeId);
                return this.ApiOk(salaryHistory);
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
        /// Get current salary for an employee
        /// </summary>
        /// <param name="employeeId">Employee ID</param>
        /// <returns>Current salary record for the employee</returns>
        [HttpGet("employee/{employeeId}/current")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetCurrentSalary(int employeeId)
        {
            try
            {
                var currentSalary = await _salaryRecordService.GetCurrentSalaryForEmployeeAsync(employeeId);
                return this.ApiOk(currentSalary);
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
        /// Create a new salary record
        /// </summary>
        /// <param name="request">Salary record details</param>
        /// <returns>Newly created salary record</returns>
        [HttpPost]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk)]
        public async Task<IActionResult> Create([FromBody] CreateSalaryRecordRequest request)
        {
            try
            {
                var salaryRecord = await _salaryRecordService.CreateSalaryRecordAsync(request);
                return this.ApiCreated(salaryRecord, "Salary record created successfully");
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
        /// Update an existing salary record
        /// </summary>
        /// <param name="id">Salary record ID</param>
        /// <param name="request">Updated salary record details</param>
        /// <returns>Updated salary record</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateSalaryRecordRequest request)
        {
            try
            {
                var salaryRecord = await _salaryRecordService.UpdateSalaryRecordAsync(id, request);
                return this.ApiOk(salaryRecord, "Salary record updated successfully");
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Salary record not found");
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
        /// Delete a salary record
        /// </summary>
        /// <param name="id">Salary record ID</param>
        /// <returns>Success status</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _salaryRecordService.DeleteSalaryRecordAsync(id);
                return this.ApiOk("Salary record deleted successfully");
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Salary record not found");
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