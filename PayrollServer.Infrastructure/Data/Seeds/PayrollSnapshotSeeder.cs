using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PayrollServer.Domain.Entities;
using PayrollServer.Infrastructure.Data.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PayrollServer.Infrastructure.Data.Seeds
{
    public static class PayrollSnapshotSeeder
    {
        public static async Task SeedPayrollSnapshotsAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

            try
            {
                // Check if payroll snapshots already exist
                var existingSnapshots = await dbContext.PayrollSnapshots.Where(p => !p.IsDeleted).CountAsync();
                if (existingSnapshots > 0)
                {
                    logger.LogInformation("Payroll snapshots already exist. Skipping seeding.");
                    return;
                }

                // Get all required data with proper includes
                var employees = await dbContext.Employees
                    .Include(e => e.Department)
                    .Include(e => e.SalaryRecords.Where(s => !s.IsDeleted))
                    .Include(e => e.AbsenceRecords.Where(a => !a.IsDeleted))
                    .Where(e => !e.IsDeleted && e.Status == "Active")
                    .ToListAsync();

                var serviceBrackets = await dbContext.ServiceBrackets
                    .Where(s => !s.IsDeleted && s.IsActive)
                    .OrderBy(s => s.MinYearsOfService)
                    .ToListAsync();

                if (!employees.Any())
                {
                    logger.LogWarning("No active employees found. Please seed employees first.");
                    return;
                }

                if (!serviceBrackets.Any())
                {
                    logger.LogWarning("No service brackets found. Please seed service brackets first.");
                    return;
                }

                var payrollSnapshots = new List<PayrollSnapshot>();
                var currentDate = DateTime.UtcNow;

                // Generate snapshots for the last 3 months using the same logic as PayrollCalculationService
                for (int monthOffset = 0; monthOffset < 3; monthOffset++)
                {
                    var targetDate = currentDate.AddMonths(-monthOffset);
                    var year = targetDate.Year;
                    var month = targetDate.Month;
                    var lastDayOfMonth = new DateTime(year, month, DateTime.DaysInMonth(year, month));

                    logger.LogInformation("Generating payroll snapshots for {Month}/{Year}...", month, year);

                    foreach (var employee in employees)
                    {
                        try
                        {
                            // Get the most recent salary record effective on or before the last day of month
                            // This matches the logic in PayrollCalculationService.CalculateGrossPayAsync
                            var salaryRecord = employee.SalaryRecords
                                .Where(s => !s.IsDeleted && s.EffectiveDate <= lastDayOfMonth)
                                .OrderByDescending(s => s.EffectiveDate)
                                .FirstOrDefault();

                            if (salaryRecord == null)
                            {
                                logger.LogWarning("No salary record found for employee {EmployeeId} effective on or before {Date}", 
                                    employee.Id, lastDayOfMonth);
                                continue;
                            }

                            // Calculate years of service as of the last day of the month
                            // This matches the logic in PayrollCalculationService
                            var yearsOfService = 0;
                            if (employee.HiringDate.HasValue)
                            {
                                var hireDate = employee.HiringDate.Value;
                                yearsOfService = lastDayOfMonth.Year - hireDate.Year;
                                if (lastDayOfMonth.Month < hireDate.Month || 
                                    (lastDayOfMonth.Month == hireDate.Month && lastDayOfMonth.Day < hireDate.Day))
                                {
                                    yearsOfService--;
                                }
                                yearsOfService = Math.Max(0, yearsOfService);
                            }

                            // Get service bracket based on years of service
                            // This matches the logic in PayrollCalculationService
                            var serviceBracket = GetServiceBracketForYearsOfService(yearsOfService, serviceBrackets);
                            decimal? serviceYearsIncentivePercentage = serviceBracket?.IncentivePercentage;

                            // Get absence record for the month
                            var absenceRecord = employee.AbsenceRecords
                                .FirstOrDefault(a => !a.IsDeleted && a.Year == year && a.Month == month);
                            
                            decimal? attendanceAdjustmentPercentage = absenceRecord?.AdjustmentPercentage;
                            var absenceDays = absenceRecord?.AbsenceDays ?? 0;

                            // Get department incentive percentage
                            decimal? departmentIncentivePercentage = employee.Department?.IncentivePercentage;

                            // Calculate incentive and adjustment amounts
                            // This matches the exact logic in PayrollCalculationService
                            var baseSalary = salaryRecord.BaseSalary;
                            var departmentIncentiveAmount = departmentIncentivePercentage.HasValue 
                                ? baseSalary * (departmentIncentivePercentage.Value / 100) 
                                : 0;
                            var serviceYearsIncentiveAmount = serviceYearsIncentivePercentage.HasValue 
                                ? baseSalary * (serviceYearsIncentivePercentage.Value / 100) 
                                : 0;
                            var attendanceAdjustmentAmount = attendanceAdjustmentPercentage.HasValue 
                                ? baseSalary * (attendanceAdjustmentPercentage.Value / 100) 
                                : 0;

                            // Calculate gross salary
                            var grossSalary = baseSalary + departmentIncentiveAmount + serviceYearsIncentiveAmount + attendanceAdjustmentAmount;

                            payrollSnapshots.Add(new PayrollSnapshot
                            {
                                EmployeeId = employee.Id,
                                Year = year,
                                Month = month,
                                BaseSalary = baseSalary,
                                DepartmentIncentiveAmount = departmentIncentiveAmount,
                                ServiceYearsIncentiveAmount = serviceYearsIncentiveAmount,
                                AttendanceAdjustmentAmount = attendanceAdjustmentAmount,
                                GrossSalary = grossSalary,
                                DepartmentIncentivePercentage = departmentIncentivePercentage,
                                ServiceYearsIncentivePercentage = serviceYearsIncentivePercentage,
                                AttendanceAdjustmentPercentage = attendanceAdjustmentPercentage,
                                AbsenceDays = absenceDays,
                                YearsOfService = yearsOfService,
                                CreatedAt = DateTime.UtcNow
                            });
                        }
                        catch (Exception ex)
                        {
                            logger.LogWarning(ex, "Failed to generate payroll snapshot for employee {EmployeeId} for {Month}/{Year}", 
                                employee.Id, month, year);
                            // Continue with next employee
                        }
                    }
                }

                // Bulk insert all snapshots
                if (payrollSnapshots.Any())
                {
                    await dbContext.PayrollSnapshots.AddRangeAsync(payrollSnapshots);
                    await dbContext.SaveChangesAsync();
                }

                logger.LogInformation("Successfully seeded {Count} payroll snapshots for {EmployeeCount} employees over 3 months", 
                    payrollSnapshots.Count, employees.Count);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error seeding payroll snapshots");
                throw;
            }
        }

        /// <summary>
        /// Find the appropriate service bracket for the given years of service
        /// This matches the logic used in the repository layer
        /// </summary>
        private static ServiceBracket GetServiceBracketForYearsOfService(int yearsOfService, List<ServiceBracket> serviceBrackets)
        {
            foreach (var bracket in serviceBrackets)
            {
                bool isMatch = yearsOfService >= bracket.MinYearsOfService &&
                              (bracket.MaxYearsOfService == null || yearsOfService < bracket.MaxYearsOfService);
                
                if (isMatch)
                {
                    return bracket;
                }
            }
            
            return null; // No matching bracket found
        }
    }
} 