using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PayrollServer.Application.DTOs.Dashboard;
using PayrollServer.Application.Interfaces.Services;
using PayrollServer.Domain.Entities;
using PayrollServer.Domain.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PayrollServer.Application.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<DashboardService> _logger;

        public DashboardService(
            IUnitOfWork unitOfWork,
            UserManager<ApplicationUser> userManager,
            ILogger<DashboardService> logger)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _logger = logger;
        }

        public async Task<DashboardStatisticsDto> GetDashboardStatisticsAsync()
        {
            try
            {
                var currentMonth = DateTime.Now.Month;
                var currentYear = DateTime.Now.Year;
                var previousMonth = currentMonth == 1 ? 12 : currentMonth - 1;
                var previousYear = currentMonth == 1 ? currentYear - 1 : currentYear;

                // Get total employees
                var totalEmployees = await _unitOfWork.Employees.CountAsync();
                var previousEmployeesCount = await _unitOfWork.Employees.CountAsync();
                // Note: Without specific filtering methods, we'll use a simple approach
                var employeesChange = 0; // Simplified for now

                // Get total departments
                var totalDepartments = await _unitOfWork.Departments.CountAsync();

                // Get current month payroll total
                var currentMonthSalaryRecords = await _unitOfWork.SalaryRecords.FindAsync(
                    s => s.EffectiveDate.Month == currentMonth && s.EffectiveDate.Year == currentYear);
                var currentMonthPayroll = currentMonthSalaryRecords.Sum(s => s.BaseSalary);

                var previousMonthSalaryRecords = await _unitOfWork.SalaryRecords.FindAsync(
                    s => s.EffectiveDate.Month == previousMonth && s.EffectiveDate.Year == previousYear);
                var previousMonthPayroll = previousMonthSalaryRecords.Sum(s => s.BaseSalary);

                var payrollChangePercentage = previousMonthPayroll > 0 
                    ? ((currentMonthPayroll - previousMonthPayroll) / previousMonthPayroll) * 100 
                    : 0;

                // Get reports generated this month (using existing data as proxy)
                var currentMonthSalaryReports = await _unitOfWork.SalaryRecords.FindAsync(
                    s => s.CreatedAt.Month == currentMonth && s.CreatedAt.Year == currentYear);
                var currentMonthAbsenceReports = await _unitOfWork.AbsenceRecords.FindAsync(
                    a => a.CreatedAt.Month == currentMonth && a.CreatedAt.Year == currentYear);
                var reportsGenerated = currentMonthSalaryReports.Count() + currentMonthAbsenceReports.Count();

                var weeklyStartDate = DateTime.Now.AddDays(-7);
                var weeklySalaryReports = await _unitOfWork.SalaryRecords.FindAsync(s => s.CreatedAt >= weeklyStartDate);
                var weeklyAbsenceReports = await _unitOfWork.AbsenceRecords.FindAsync(a => a.CreatedAt >= weeklyStartDate);
                var reportsThisWeek = weeklySalaryReports.Count() + weeklyAbsenceReports.Count();

                var statistics = new DashboardStatisticsDto
                {
                    TotalEmployees = new StatisticDto
                    {
                        Title = "Total Employees",
                        Value = totalEmployees.ToString(),
                        Change = employeesChange > 0 ? $"+{employeesChange} this month" : 
                                employeesChange < 0 ? $"{employeesChange} this month" : "No changes",
                        Icon = "People"
                    },
                    TotalDepartments = new StatisticDto
                    {
                        Title = "Departments",
                        Value = totalDepartments.ToString(),
                        Change = "No changes",
                        Icon = "Business"
                    },
                    MonthlyPayroll = new StatisticDto
                    {
                        Title = "Monthly Payroll",
                        Value = $"${currentMonthPayroll:N0}",
                        Change = payrollChangePercentage != 0 
                            ? $"{(payrollChangePercentage > 0 ? "+" : "")}{payrollChangePercentage:F1}% from last month"
                            : "No change from last month",
                        Icon = "AccountBalance"
                    },
                    ReportsGenerated = new StatisticDto
                    {
                        Title = "Reports Generated",
                        Value = reportsGenerated.ToString(),
                        Change = $"{reportsThisWeek} this week",
                        Icon = "Assessment"
                    }
                };

                return statistics;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard statistics");
                throw;
            }
        }

        public async Task<IEnumerable<RecentActivityDto>> GetRecentActivitiesAsync(int limit = 10)
        {
            try
            {
                var activities = new List<RecentActivityDto>();

                // Get recent salary records
                var recentSalaryRecords = await _unitOfWork.SalaryRecords.GetRecentSalaryRecordsWithEmployeeAsync(5);
                foreach (var salary in recentSalaryRecords)
                {
                    activities.Add(new RecentActivityDto
                    {
                        Title = $"Salary updated for {salary.Employee.FirstName} {salary.Employee.LastName}",
                        Description = $"New salary: ${salary.BaseSalary:N0}",
                        Time = GetRelativeTime(salary.CreatedAt),
                        Status = "completed",
                        Icon = "AccountBalance",
                        Type = "salary"
                    });
                }

                // Get recent employee additions
                var recentEmployees = await _unitOfWork.Employees.GetRecentEmployeesWithDetailsAsync(5);
                foreach (var employee in recentEmployees)
                {
                    activities.Add(new RecentActivityDto
                    {
                        Title = $"New employee added: {employee.FirstName} {employee.LastName}",
                        Description = $"{employee.JobGrade?.Name ?? "Staff"}, {employee.Department?.Name ?? "Unknown Department"}",
                        Time = GetRelativeTime(employee.CreatedAt),
                        Status = "info",
                        Icon = "PersonAdd",
                        Type = "employee"
                    });
                }

                // Get recent absence records
                var recentAbsences = await _unitOfWork.AbsenceRecords.GetRecentAbsencesWithEmployeeAsync(3);
                foreach (var absence in recentAbsences)
                {
                    activities.Add(new RecentActivityDto
                    {
                        Title = $"Absence recorded: {absence.Employee.FirstName} {absence.Employee.LastName}",
                        Description = $"{absence.AbsenceDays} days absent",
                        Time = GetRelativeTime(absence.CreatedAt),
                        Status = "warning",
                        Icon = "Schedule",
                        Type = "absence"
                    });
                }

                // Sort all activities by time and take the requested limit
                var sortedActivities = activities
                    .OrderByDescending(a => ParseRelativeTime(a.Time))
                    .Take(limit)
                    .ToList();

                return sortedActivities;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent activities");
                throw;
            }
        }

        public async Task<SystemOverviewDto> GetSystemOverviewAsync(int userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId.ToString());
                var totalActiveUsers = await _userManager.Users.CountAsync(u => u.IsActive && !u.IsDeleted);

                var overview = new SystemOverviewDto
                {
                    SystemStatus = "Online",
                    LastSync = DateTime.Now,
                    UserName = user != null ? $"{user.FirstName} {user.LastName}" : "Unknown User",
                    UserRole = "Unknown", // This should come from claims in the controller
                    TotalActiveUsers = totalActiveUsers,
                    DatabaseStatus = "Connected",
                    Version = "1.0.0"
                };

                return overview;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting system overview");
                throw;
            }
        }

        public async Task<PayrollSummaryDto> GetPayrollSummaryAsync()
        {
            try
            {
                var currentMonth = DateTime.Now.Month;
                var currentYear = DateTime.Now.Year;

                var salaryRecords = await _unitOfWork.SalaryRecords.FindAsync(
                    s => s.EffectiveDate.Month == currentMonth && s.EffectiveDate.Year == currentYear);

                var summary = new PayrollSummaryDto
                {
                    TotalPayroll = salaryRecords.Sum(s => s.BaseSalary),
                    AveragePayroll = salaryRecords.Any() ? salaryRecords.Average(s => s.BaseSalary) : 0,
                    EmployeesWithPayroll = salaryRecords.Count(),
                    Month = DateTime.Now.ToString("MMMM yyyy"),
                    ProcessedDate = DateTime.Now
                };

                return summary;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payroll summary");
                throw;
            }
        }

        private string GetRelativeTime(DateTime dateTime)
        {
            var timeSpan = DateTime.Now - dateTime;

            if (timeSpan.TotalMinutes < 1)
                return "Just now";
            if (timeSpan.TotalMinutes < 60)
                return $"{(int)timeSpan.TotalMinutes} minutes ago";
            if (timeSpan.TotalHours < 24)
                return $"{(int)timeSpan.TotalHours} hours ago";
            if (timeSpan.TotalDays < 7)
                return $"{(int)timeSpan.TotalDays} days ago";
            if (timeSpan.TotalDays < 30)
                return $"{(int)(timeSpan.TotalDays / 7)} weeks ago";
            
            return dateTime.ToString("MMM dd, yyyy");
        }

        private DateTime ParseRelativeTime(string relativeTime)
        {
            // This is a simple parser for sorting purposes
            try
            {
                if (relativeTime.Contains("minutes ago"))
                {
                    var minutes = int.Parse(relativeTime.Split(' ')[0]);
                    return DateTime.Now.AddMinutes(-minutes);
                }
                if (relativeTime.Contains("hours ago"))
                {
                    var hours = int.Parse(relativeTime.Split(' ')[0]);
                    return DateTime.Now.AddHours(-hours);
                }
                if (relativeTime.Contains("days ago"))
                {
                    var days = int.Parse(relativeTime.Split(' ')[0]);
                    return DateTime.Now.AddDays(-days);
                }
                if (relativeTime.Contains("weeks ago"))
                {
                    var weeks = int.Parse(relativeTime.Split(' ')[0]);
                    return DateTime.Now.AddDays(-weeks * 7);
                }
            }
            catch
            {
            }
            
            return DateTime.Now.AddYears(-1); 
        }
    }
} 