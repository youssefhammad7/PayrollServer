using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PayrollServer.Application.DTOs.PayrollSnapshot;
using PayrollServer.Application.Interfaces.Services;
using PayrollServer.Extensions;
using PayrollServer.Infrastructure.Identity.Constants;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Controllers
{
    public class PayrollController : BaseApiController
    {
        private readonly IPayrollCalculationService _payrollCalculationService;

        public PayrollController(IPayrollCalculationService payrollCalculationService)
        {
            _payrollCalculationService = payrollCalculationService;
        }

        /// <summary>
        /// Calculate gross pay for a specific employee without persisting
        /// </summary>
        /// <param name="employeeId">Employee ID</param>
        /// <param name="year">Year</param>
        /// <param name="month">Month (1-12)</param>
        /// <returns>Calculated payroll details</returns>
        [HttpGet("calculate/{employeeId}/{year}/{month}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk)]
        public async Task<IActionResult> CalculateGrossPay(int employeeId, int year, int month)
        {
            try
            {
                var payrollSnapshot = await _payrollCalculationService.CalculateGrossPayAsync(employeeId, year, month);
                return this.ApiOk(payrollSnapshot);
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
        /// Calculate gross pay for all employees without persisting
        /// </summary>
        /// <param name="year">Year</param>
        /// <param name="month">Month (1-12)</param>
        /// <returns>List of calculated payroll details</returns>
        [HttpGet("calculate-all/{year}/{month}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk)]
        public async Task<IActionResult> CalculateGrossPayForAll(int year, int month)
        {
            try
            {
                var payrollSnapshots = await _payrollCalculationService.CalculateGrossPayForAllAsync(year, month);
                return this.ApiOk(payrollSnapshots);
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Generate and persist payroll snapshots for all employees for a given month
        /// </summary>
        /// <param name="year">Year</param>
        /// <param name="month">Month (1-12)</param>
        /// <returns>Success status</returns>
        [HttpPost("generate/{year}/{month}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> GenerateMonthlyPayrollSnapshots(int year, int month)
        {
            try
            {
                var result = await _payrollCalculationService.GenerateMonthlyPayrollSnapshotsAsync(year, month);
                if (result)
                {
                    return this.ApiOk("Payroll snapshots generated successfully");
                }
                else
                {
                    return this.ApiBadRequest("Failed to generate payroll snapshots for majority of employees");
                }
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Get all payroll snapshots for a given month
        /// </summary>
        /// <param name="year">Year</param>
        /// <param name="month">Month (1-12)</param>
        /// <returns>List of payroll snapshots</returns>
        [HttpGet("{year}/{month}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetPayrollSnapshots(int year, int month)
        {
            try
            {
                var payrollSnapshots = await _payrollCalculationService.GetPayrollSnapshotsAsync(year, month);
                return this.ApiOk(payrollSnapshots);
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Get payroll snapshots for a specific employee
        /// </summary>
        /// <param name="employeeId">Employee ID</param>
        /// <returns>List of employee's payroll snapshots</returns>
        [HttpGet("employee/{employeeId}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetPayrollSnapshotsForEmployee(int employeeId)
        {
            try
            {
                var payrollSnapshots = await _payrollCalculationService.GetPayrollSnapshotsForEmployeeAsync(employeeId);
                return this.ApiOk(payrollSnapshots);
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Get payroll snapshot for a specific employee for a given month
        /// </summary>
        /// <param name="employeeId">Employee ID</param>
        /// <param name="year">Year</param>
        /// <param name="month">Month (1-12)</param>
        /// <returns>Payroll snapshot details</returns>
        [HttpGet("employee/{employeeId}/{year}/{month}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetPayrollSnapshot(int employeeId, int year, int month)
        {
            try
            {
                var payrollSnapshot = await _payrollCalculationService.GetPayrollSnapshotAsync(employeeId, year, month);
                return this.ApiOk(payrollSnapshot);
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound("Payroll snapshot not found");
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Get payroll snapshots for a specific department for a given month
        /// </summary>
        /// <param name="departmentId">Department ID</param>
        /// <param name="year">Year</param>
        /// <param name="month">Month (1-12)</param>
        /// <returns>List of department's payroll snapshots</returns>
        [HttpGet("department/{departmentId}/{year}/{month}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetPayrollSnapshotsByDepartment(int departmentId, int year, int month)
        {
            try
            {
                var payrollSnapshots = await _payrollCalculationService.GetPayrollSnapshotsByDepartmentAsync(departmentId, year, month);
                return this.ApiOk(payrollSnapshots);
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }
    }
} 