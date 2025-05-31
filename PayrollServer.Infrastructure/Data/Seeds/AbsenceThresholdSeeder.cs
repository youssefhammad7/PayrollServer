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
    public static class AbsenceThresholdSeeder
    {
        public static async Task SeedAbsenceThresholdsAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

            try
            {
                // Check if absence thresholds already exist
                var existingThresholds = await dbContext.AbsenceThresholds.Where(a => !a.IsDeleted).CountAsync();
                if (existingThresholds > 0)
                {
                    logger.LogInformation("Absence thresholds already exist. Skipping seeding.");
                    return;
                }

                var absenceThresholds = new[]
                {
                    new AbsenceThreshold
                    {
                        Name = "Perfect Attendance",
                        MinAbsenceDays = 0,
                        MaxAbsenceDays = 0,
                        AdjustmentPercentage = 5.0m, // 5% bonus for perfect attendance
                        Description = "No absences - 5% bonus incentive",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new AbsenceThreshold
                    {
                        Name = "Excellent Attendance",
                        MinAbsenceDays = 1,
                        MaxAbsenceDays = 1,
                        AdjustmentPercentage = 2.0m, // 2% bonus for 1 day absence
                        Description = "1 day absence - 2% bonus incentive",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new AbsenceThreshold
                    {
                        Name = "Good Attendance",
                        MinAbsenceDays = 2,
                        MaxAbsenceDays = 2,
                        AdjustmentPercentage = 0.0m, // No adjustment
                        Description = "2 days absence - no adjustment",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new AbsenceThreshold
                    {
                        Name = "Acceptable Attendance",
                        MinAbsenceDays = 3,
                        MaxAbsenceDays = 3,
                        AdjustmentPercentage = -2.0m, // 2% deduction
                        Description = "3 days absence - 2% deduction",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new AbsenceThreshold
                    {
                        Name = "Poor Attendance",
                        MinAbsenceDays = 4,
                        MaxAbsenceDays = 5,
                        AdjustmentPercentage = -5.0m, // 5% deduction
                        Description = "4-5 days absence - 5% deduction",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new AbsenceThreshold
                    {
                        Name = "Unacceptable Attendance",
                        MinAbsenceDays = 6,
                        MaxAbsenceDays = null, // 6 or more days
                        AdjustmentPercentage = -10.0m, // 10% deduction
                        Description = "6+ days absence - 10% deduction",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    }
                };

                await dbContext.AbsenceThresholds.AddRangeAsync(absenceThresholds);
                await dbContext.SaveChangesAsync();

                logger.LogInformation("Successfully seeded {Count} absence thresholds", absenceThresholds.Length);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error seeding absence thresholds");
                throw;
            }
        }
    }
} 