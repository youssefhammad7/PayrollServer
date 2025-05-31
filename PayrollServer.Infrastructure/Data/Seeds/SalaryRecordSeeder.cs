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
    public static class SalaryRecordSeeder
    {
        public static async Task SeedSalaryRecordsAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

            try
            {
                // Check if salary records already exist
                var existingSalaryRecords = await dbContext.SalaryRecords.Where(s => !s.IsDeleted).CountAsync();
                if (existingSalaryRecords > 0)
                {
                    logger.LogInformation("Salary records already exist. Skipping seeding.");
                    return;
                }

                // Get employees with their job grades
                var employees = await dbContext.Employees
                    .Include(e => e.JobGrade)
                    .Where(e => !e.IsDeleted)
                    .ToListAsync();

                if (!employees.Any())
                {
                    logger.LogWarning("No employees found. Please seed employees first.");
                    return;
                }

                var salaryRecords = new List<SalaryRecord>();
                var random = new Random(42); // Fixed seed for consistent results

                foreach (var employee in employees)
                {
                    // Calculate base salary within job grade range
                    var minSalary = employee.JobGrade.MinSalary;
                    var maxSalary = employee.JobGrade.MaxSalary;
                    var salaryRange = maxSalary - minSalary;
                    
                    // Position within range based on years of service
                    var yearsOfService = DateTime.UtcNow.Year - employee.HiringDate?.Year ?? 0;
                    var serviceMultiplier = Math.Min(yearsOfService / 10.0, 1.0); // Max out at 10 years
                    
                    // Add some randomness for variety
                    var randomFactor = 0.8 + (random.NextDouble() * 0.4); // Between 0.8 and 1.2
                    
                    var baseSalary = minSalary + (salaryRange * (decimal)serviceMultiplier * (decimal)randomFactor);
                    baseSalary = Math.Round(baseSalary, 2);

                    // Create historical salary record (hiring date)
                    if (employee.HiringDate.HasValue)
                    {
                        var initialSalary = baseSalary * 0.85m; // 15% lower initially
                        salaryRecords.Add(new SalaryRecord
                        {
                            EmployeeId = employee.Id,
                            BaseSalary = Math.Round(initialSalary, 2),
                            EffectiveDate = employee.HiringDate.Value,
                            Notes = "Initial hiring salary",
                            CreatedAt = DateTime.UtcNow
                        });

                        // Add salary increases over time if employee has been with company for more than 1 year
                        if (yearsOfService > 1)
                        {
                            for (int year = 1; year <= yearsOfService && year <= 5; year++)
                            {
                                var increaseDate = employee.HiringDate.Value.AddYears(year);
                                if (increaseDate <= DateTime.UtcNow)
                                {
                                    var increaseMultiplier = 1.0m + (year * 0.05m); // 5% increase per year
                                    var increasedSalary = Math.Round(initialSalary * increaseMultiplier, 2);
                                    
                                    salaryRecords.Add(new SalaryRecord
                                    {
                                        EmployeeId = employee.Id,
                                        BaseSalary = increasedSalary,
                                        EffectiveDate = increaseDate,
                                        Notes = $"Annual salary review - Year {year}",
                                        CreatedAt = DateTime.UtcNow
                                    });
                                }
                            }
                        }
                    }

                    // Current salary record
                    salaryRecords.Add(new SalaryRecord
                    {
                        EmployeeId = employee.Id,
                        BaseSalary = baseSalary,
                        EffectiveDate = DateTime.UtcNow.AddMonths(-2), // Effective 2 months ago
                        Notes = "Current salary",
                        CreatedAt = DateTime.UtcNow
                    });
                }

                await dbContext.SalaryRecords.AddRangeAsync(salaryRecords);
                await dbContext.SaveChangesAsync();

                logger.LogInformation("Successfully seeded {Count} salary records for {EmployeeCount} employees", 
                    salaryRecords.Count, employees.Count);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error seeding salary records");
                throw;
            }
        }
    }
} 