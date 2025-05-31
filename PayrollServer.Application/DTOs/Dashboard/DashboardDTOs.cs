using System;
using System.Collections.Generic;

namespace PayrollServer.Application.DTOs.Dashboard
{
    public class DashboardStatisticsDto
    {
        public StatisticDto TotalEmployees { get; set; } = new();
        public StatisticDto TotalDepartments { get; set; } = new();
        public StatisticDto MonthlyPayroll { get; set; } = new();
        public StatisticDto ReportsGenerated { get; set; } = new();
    }

    public class StatisticDto
    {
        public string Title { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string Change { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
    }

    public class RecentActivityDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Time { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
    }

    public class SystemOverviewDto
    {
        public string SystemStatus { get; set; } = string.Empty;
        public DateTime LastSync { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserRole { get; set; } = string.Empty;
        public int TotalActiveUsers { get; set; }
        public string DatabaseStatus { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
    }

    public class PayrollSummaryDto
    {
        public decimal TotalPayroll { get; set; }
        public decimal AveragePayroll { get; set; }
        public int EmployeesWithPayroll { get; set; }
        public string Month { get; set; } = string.Empty;
        public DateTime ProcessedDate { get; set; }
    }

    public class QuickActionDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string[] Roles { get; set; } = Array.Empty<string>();
        public string NavigationPath { get; set; } = string.Empty;
    }
} 