using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PayrollServer.Domain.Entities;
using PayrollServer.Infrastructure.Data.Context;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace PayrollServer.Infrastructure.Data.Seeds
{
    public static class IncentiveSeeder
    {
        public static async Task SeedIncentivesAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

            try
            {
                // Check if incentives already exist
                var existingIncentives = await dbContext.Incentives.Where(i => !i.IsDeleted).CountAsync();
                if (existingIncentives > 0)
                {
                    logger.LogInformation("Incentives already exist. Skipping seeding.");
                    return;
                }

                // Get employees with their current salary records
                var employees = await dbContext.Employees
                    .Include(e => e.SalaryRecords)
                    .Include(e => e.Department)
                    .Where(e => !e.IsDeleted)
                    .ToListAsync();

                if (!employees.Any())
                {
                    logger.LogWarning("No employees found. Please seed employees first.");
                    return;
                }

                var incentives = new List<Incentive>();
                var random = new Random(42); // Fixed seed for consistent results

                foreach (var employee in employees)
                {
                    var currentSalary = employee.SalaryRecords
                        .Where(s => !s.IsDeleted)
                        .OrderByDescending(s => s.EffectiveDate)
                        .FirstOrDefault()?.BaseSalary ?? 50000m;

                    // Annual performance bonus (for employees with 1+ years)
                    var yearsOfService = DateTime.UtcNow.Year - (employee.HiringDate?.Year ?? DateTime.UtcNow.Year);
                    if (yearsOfService >= 1)
                    {
                        var performanceRating = random.NextDouble();
                        if (performanceRating > 0.3) // 70% of employees get performance bonus
                        {
                            var bonusPercentage = performanceRating switch
                            {
                                > 0.8 => 0.15m, // Excellent: 15%
                                > 0.6 => 0.10m, // Good: 10%
                                _ => 0.05m      // Satisfactory: 5%
                            };

                            incentives.Add(new Incentive
                            {
                                EmployeeId = employee.Id,
                                Title = "Annual Performance Bonus",
                                Description = $"Performance bonus for {DateTime.UtcNow.Year - 1}",
                                Amount = Math.Round(currentSalary * bonusPercentage, 2),
                                Date = new DateTime(DateTime.UtcNow.Year, 3, 15), // March 15th
                                Type = "Performance",
                                IsTaxable = true,
                                CreatedAt = DateTime.UtcNow
                            });
                        }
                    }

                    // Project completion bonuses (IT and Sales primarily)
                    if (employee.Department.Name == "Information Technology" || 
                        employee.Department.Name == "Sales")
                    {
                        var projectBonusChance = random.NextDouble();
                        if (projectBonusChance > 0.6) // 40% chance
                        {
                            var projectBonusAmount = random.Next(500, 3000);
                            incentives.Add(new Incentive
                            {
                                EmployeeId = employee.Id,
                                Title = "Project Completion Bonus",
                                Description = employee.Department.Name == "Information Technology" 
                                    ? "Software project milestone achievement"
                                    : "Sales target achievement",
                                Amount = projectBonusAmount,
                                Date = DateTime.UtcNow.AddDays(-random.Next(30, 180)),
                                Type = "Project",
                                IsTaxable = true,
                                CreatedAt = DateTime.UtcNow
                            });
                        }
                    }

                    // Spot awards for exceptional work
                    var spotAwardChance = random.NextDouble();
                    if (spotAwardChance > 0.75) // 25% chance
                    {
                        var spotAwardAmount = random.Next(100, 500);
                        incentives.Add(new Incentive
                        {
                            EmployeeId = employee.Id,
                            Title = "Spot Award",
                            Description = "Recognition for exceptional work and dedication",
                            Amount = spotAwardAmount,
                            Date = DateTime.UtcNow.AddDays(-random.Next(1, 90)),
                            Type = "Recognition",
                            IsTaxable = true,
                            CreatedAt = DateTime.UtcNow
                        });
                    }

                    // Referral bonuses
                    var referralChance = random.NextDouble();
                    if (referralChance > 0.85) // 15% chance
                    {
                        incentives.Add(new Incentive
                        {
                            EmployeeId = employee.Id,
                            Title = "Employee Referral Bonus",
                            Description = "Successful employee referral",
                            Amount = 1000m,
                            Date = DateTime.UtcNow.AddDays(-random.Next(15, 120)),
                            Type = "Referral",
                            IsTaxable = true,
                            CreatedAt = DateTime.UtcNow
                        });
                    }

                    // Long service awards (for employees with 5+ years)
                    if (yearsOfService >= 5 && yearsOfService % 5 == 0)
                    {
                        incentives.Add(new Incentive
                        {
                            EmployeeId = employee.Id,
                            Title = $"{yearsOfService}-Year Service Award",
                            Description = $"Recognition for {yearsOfService} years of dedicated service",
                            Amount = yearsOfService * 100m, // $100 per year of service
                            Date = employee.HiringDate?.AddYears(yearsOfService) ?? DateTime.UtcNow,
                            Type = "Service",
                            IsTaxable = false, // Service awards might be non-taxable up to certain limits
                            CreatedAt = DateTime.UtcNow
                        });
                    }

                    // Holiday bonuses
                    var holidayBonusChance = random.NextDouble();
                    if (holidayBonusChance > 0.4) // 60% of employees get holiday bonus
                    {
                        incentives.Add(new Incentive
                        {
                            EmployeeId = employee.Id,
                            Title = "Holiday Bonus",
                            Description = $"Year-end holiday bonus for {DateTime.UtcNow.Year - 1}",
                            Amount = Math.Round(currentSalary * 0.08m, 2), // 8% of salary
                            Date = new DateTime(DateTime.UtcNow.Year - 1, 12, 20),
                            Type = "Holiday",
                            IsTaxable = true,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }

                await dbContext.Incentives.AddRangeAsync(incentives);
                await dbContext.SaveChangesAsync();

                logger.LogInformation("Successfully seeded {Count} incentives for employees", incentives.Count);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error seeding incentives");
                throw;
            }
        }
    }
} 