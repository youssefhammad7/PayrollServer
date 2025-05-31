using PayrollServer.Application.DTOs.Dashboard;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Application.Interfaces.Services
{
    public interface IDashboardService
    {
        Task<DashboardStatisticsDto> GetDashboardStatisticsAsync();
        Task<IEnumerable<RecentActivityDto>> GetRecentActivitiesAsync(int limit = 10);
        Task<SystemOverviewDto> GetSystemOverviewAsync(int userId);
        Task<PayrollSummaryDto> GetPayrollSummaryAsync();
    }
} 