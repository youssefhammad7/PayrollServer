using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PayrollServer.Application.DTOs.Dashboard;
using PayrollServer.Application.Interfaces.Services;
using PayrollServer.Extensions;
using PayrollServer.Infrastructure.Identity.Constants;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PayrollServer.Controllers
{
    [Authorize]
    public class DashboardController : BaseApiController
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        /// <summary>
        /// Get dashboard statistics including employee count, department count, payroll totals, etc.
        /// </summary>
        [HttpGet("statistics")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetDashboardStatistics()
        {
            try
            {
                var statistics = await _dashboardService.GetDashboardStatisticsAsync();
                return this.ApiOk(statistics);
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Get recent activities for the dashboard
        /// </summary>
        [HttpGet("recent-activities")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetRecentActivities([FromQuery] int limit = 10)
        {
            try
            {
                var activities = await _dashboardService.GetRecentActivitiesAsync(limit);
                return this.ApiOk(activities);
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Get system overview information
        /// </summary>
        [HttpGet("system-overview")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetSystemOverview()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                {
                    return this.ApiBadRequest("Invalid user ID");
                }

                var overview = await _dashboardService.GetSystemOverviewAsync(userId);
                
                // Set the user role from claims
                overview.UserRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "Unknown";
                
                return this.ApiOk(overview);
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }

        /// <summary>
        /// Get payroll summary for the current month
        /// </summary>
        [HttpGet("payroll-summary")]
        [Authorize(Roles = Roles.Admin + "," + Roles.HRClerk + "," + Roles.ReadOnly)]
        public async Task<IActionResult> GetPayrollSummary()
        {
            try
            {
                var summary = await _dashboardService.GetPayrollSummaryAsync();
                return this.ApiOk(summary);
            }
            catch (System.Exception ex)
            {
                return this.ApiServerError(ex);
            }
        }
    }
} 