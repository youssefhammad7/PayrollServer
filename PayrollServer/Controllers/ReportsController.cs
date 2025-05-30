using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PayrollServer.Application.DTOs.Report;
using PayrollServer.Application.Interfaces.Services;
using PayrollServer.Extensions;
using PayrollServer.Infrastructure.Identity.Constants;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Controllers
{
    [Authorize]
    public class ReportsController : BaseApiController
    {
        private readonly IReportingService _reportingService;

        public ReportsController(IReportingService reportingService)
        {
            _reportingService = reportingService;
        }

        /// <summary>
        /// Generate attendance and absence report for a specific month (US-21)
        /// </summary>
        /// <param name="year">Year</param>
        /// <param name="month">Month (1-12)</param>
        /// <param name="departmentId">Optional department ID filter</param>
        /// <returns>Attendance report data</returns>
        [HttpGet("attendance/{year}/{month}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk)]
        public async Task<IActionResult> GetAttendanceReport(int year, int month, [FromQuery] int? departmentId = null)
        {
            try
            {
                var report = await _reportingService.GetAttendanceReportAsync(year, month, departmentId);
                return this.ApiOk(report);
            }
            catch (Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Generate incentives and deductions report for a specific month (US-22)
        /// </summary>
        /// <param name="year">Year</param>
        /// <param name="month">Month (1-12)</param>
        /// <param name="departmentId">Optional department ID filter</param>
        /// <returns>Incentives report data</returns>
        [HttpGet("incentives/{year}/{month}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk)]
        public async Task<IActionResult> GetIncentivesReport(int year, int month, [FromQuery] int? departmentId = null)
        {
            try
            {
                var report = await _reportingService.GetIncentiveReportAsync(year, month, departmentId);
                return this.ApiOk(report);
            }
            catch (Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Generate employee directory report with active employees (US-23)
        /// </summary>
        /// <param name="departmentId">Optional department ID filter</param>
        /// <returns>Employee directory data</returns>
        [HttpGet("employee-directory")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetEmployeeDirectoryReport([FromQuery] int? departmentId = null)
        {
            try
            {
                var report = await _reportingService.GetEmployeeDirectoryReportAsync(departmentId);
                return this.ApiOk(report);
            }
            catch (Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Generate salary report for a specific month (US-24)
        /// </summary>
        /// <param name="year">Year</param>
        /// <param name="month">Month (1-12)</param>
        /// <param name="departmentId">Optional department ID filter</param>
        /// <returns>Salary report data with summary</returns>
        [HttpGet("salary/{year}/{month}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk)]
        public async Task<IActionResult> GetSalaryReport(int year, int month, [FromQuery] int? departmentId = null)
        {
            try
            {
                var (employees, summary) = await _reportingService.GetSalaryReportAsync(year, month, departmentId);
                return this.ApiOk(new { Employees = employees, Summary = summary });
            }
            catch (Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Generate salary report for a specific employee for a given month
        /// </summary>
        /// <param name="employeeId">Employee ID</param>
        /// <param name="year">Year</param>
        /// <param name="month">Month (1-12)</param>
        /// <returns>Salary report data for the employee</returns>
        [HttpGet("salary/employee/{employeeId}/{year}/{month}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk)]
        public async Task<IActionResult> GetEmployeeSalaryReport(int employeeId, int year, int month)
        {
            try
            {
                var report = await _reportingService.GetEmployeeSalaryReportAsync(employeeId, year, month);
                return this.ApiOk(report);
            }
            catch (Domain.Exceptions.EntityNotFoundException)
            {
                return this.ApiNotFound($"Employee with ID {employeeId} not found");
            }
            catch (Domain.Exceptions.BusinessRuleViolationException ex)
            {
                return this.ApiBadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Export any report to CSV format
        /// </summary>
        /// <param name="reportType">Report type: attendance, incentives, employee-directory, salary</param>
        /// <param name="year">Year (required for attendance, incentives, salary)</param>
        /// <param name="month">Month (required for attendance, incentives, salary)</param>
        /// <param name="departmentId">Optional department ID filter</param>
        /// <returns>CSV file</returns>
        [HttpGet("export/csv/{reportType}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk)]
        public async Task<IActionResult> ExportToCsv(
            string reportType, 
            [FromQuery] int? year = null, 
            [FromQuery] int? month = null, 
            [FromQuery] int? departmentId = null)
        {
            try
            {
                byte[] fileContents;
                string fileName;

                switch (reportType.ToLower())
                {
                    case "attendance":
                        if (!year.HasValue || !month.HasValue)
                            return this.ApiBadRequest("Year and month are required for attendance report");
                            
                        var attendanceReport = await _reportingService.GetAttendanceReportAsync(year.Value, month.Value, departmentId);
                        fileContents = await _reportingService.ExportToCsvAsync(attendanceReport);
                        fileName = $"Attendance_Report_{year.Value}_{month.Value}.csv";
                        break;

                    case "incentives":
                        if (!year.HasValue || !month.HasValue)
                            return this.ApiBadRequest("Year and month are required for incentives report");
                            
                        var incentivesReport = await _reportingService.GetIncentiveReportAsync(year.Value, month.Value, departmentId);
                        fileContents = await _reportingService.ExportToCsvAsync(incentivesReport);
                        fileName = $"Incentives_Report_{year.Value}_{month.Value}.csv";
                        break;

                    case "employee-directory":
                        var directoryReport = await _reportingService.GetEmployeeDirectoryReportAsync(departmentId);
                        fileContents = await _reportingService.ExportToCsvAsync(directoryReport);
                        fileName = $"Employee_Directory_{DateTime.Now:yyyyMMdd}.csv";
                        break;

                    case "salary":
                        if (!year.HasValue || !month.HasValue)
                            return this.ApiBadRequest("Year and month are required for salary report");
                            
                        var (salaryData, _) = await _reportingService.GetSalaryReportAsync(year.Value, month.Value, departmentId);
                        fileContents = await _reportingService.ExportToCsvAsync(salaryData);
                        fileName = $"Salary_Report_{year.Value}_{month.Value}.csv";
                        break;

                    default:
                        return this.ApiBadRequest($"Invalid report type: {reportType}. Available options: attendance, incentives, employee-directory, salary");
                }

                return File(fileContents, "text/csv", fileName);
            }
            catch (Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Export any report to PDF format
        /// </summary>
        /// <param name="reportType">Report type: attendance, incentives, employee-directory, salary</param>
        /// <param name="year">Year (required for attendance, incentives, salary)</param>
        /// <param name="month">Month (required for attendance, incentives, salary)</param>
        /// <param name="departmentId">Optional department ID filter</param>
        /// <returns>PDF file</returns>
        [HttpGet("export/pdf/{reportType}")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk)]
        public async Task<IActionResult> ExportToPdf(
            string reportType, 
            [FromQuery] int? year = null, 
            [FromQuery] int? month = null, 
            [FromQuery] int? departmentId = null)
        {
            try
            {
                byte[] fileContents;
                string fileName;
                string reportTitle;

                switch (reportType.ToLower())
                {
                    case "attendance":
                        if (!year.HasValue || !month.HasValue)
                            return this.ApiBadRequest("Year and month are required for attendance report");
                            
                        var attendanceReport = await _reportingService.GetAttendanceReportAsync(year.Value, month.Value, departmentId);
                        reportTitle = $"Attendance Report - {new DateTime(year.Value, month.Value, 1):MMMM yyyy}";
                        fileContents = await _reportingService.ExportToPdfAsync(attendanceReport, reportTitle);
                        fileName = $"Attendance_Report_{year.Value}_{month.Value}.pdf";
                        break;

                    case "incentives":
                        if (!year.HasValue || !month.HasValue)
                            return this.ApiBadRequest("Year and month are required for incentives report");
                            
                        var incentivesReport = await _reportingService.GetIncentiveReportAsync(year.Value, month.Value, departmentId);
                        reportTitle = $"Incentives Report - {new DateTime(year.Value, month.Value, 1):MMMM yyyy}";
                        fileContents = await _reportingService.ExportToPdfAsync(incentivesReport, reportTitle);
                        fileName = $"Incentives_Report_{year.Value}_{month.Value}.pdf";
                        break;

                    case "employee-directory":
                        var directoryReport = await _reportingService.GetEmployeeDirectoryReportAsync(departmentId);
                        reportTitle = $"Employee Directory - {DateTime.Now:MMMM yyyy}";
                        fileContents = await _reportingService.ExportToPdfAsync(directoryReport, reportTitle);
                        fileName = $"Employee_Directory_{DateTime.Now:yyyyMMdd}.pdf";
                        break;

                    case "salary":
                        if (!year.HasValue || !month.HasValue)
                            return this.ApiBadRequest("Year and month are required for salary report");
                            
                        var (salaryData, _) = await _reportingService.GetSalaryReportAsync(year.Value, month.Value, departmentId);
                        reportTitle = $"Salary Report - {new DateTime(year.Value, month.Value, 1):MMMM yyyy}";
                        fileContents = await _reportingService.ExportToPdfAsync(salaryData, reportTitle);
                        fileName = $"Salary_Report_{year.Value}_{month.Value}.pdf";
                        break;

                    default:
                        return this.ApiBadRequest($"Invalid report type: {reportType}. Available options: attendance, incentives, employee-directory, salary");
                }

                return File(fileContents, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }
    }
} 