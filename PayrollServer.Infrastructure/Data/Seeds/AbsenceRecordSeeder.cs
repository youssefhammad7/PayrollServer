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
    public static class AbsenceRecordSeeder
    {
        public static async Task SeedAbsenceRecordsAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

            try
            {
                // Check if absence records already exist
                var existingAbsenceRecords = await dbContext.AbsenceRecords.Where(a => !a.IsDeleted).CountAsync();
                if (existingAbsenceRecords > 0)
                {
                    logger.LogInformation("Absence records already exist. Skipping seeding.");
                    return;
                }

                // Get employees and absence thresholds
                var employees = await dbContext.Employees.Where(e => !e.IsDeleted).ToListAsync();
                var absenceThresholds = await dbContext.AbsenceThresholds
                    .Where(a => !a.IsDeleted && a.IsActive)
                    .OrderBy(a => a.MinAbsenceDays)
                    .ToListAsync();

                if (!employees.Any())
                {
                    logger.LogWarning("No employees found. Please seed employees first.");
                    return;
                }

                if (!absenceThresholds.Any())
                {
                    logger.LogWarning("No absence thresholds found. Please seed absence thresholds first.");
                    return;
                }

                var absenceRecords = new List<AbsenceRecord>();
                var random = new Random(42); // Fixed seed for consistent results
                var currentDate = DateTime.UtcNow;
                
                // Create absence records for the last 6 months
                for (int monthOffset = 0; monthOffset < 6; monthOffset++)
                {
                    var targetDate = currentDate.AddMonths(-monthOffset);
                    var year = targetDate.Year;
                    var month = targetDate.Month;

                    foreach (var employee in employees)
                    {
                        // Generate realistic absence patterns
                        int absenceDays = GenerateRealisticAbsenceDays(random, employee, monthOffset);
                        
                        // Find matching threshold and calculate adjustment percentage
                        decimal? adjustmentPercentage = CalculateAdjustmentPercentage(absenceDays, absenceThresholds);

                        absenceRecords.Add(new AbsenceRecord
                        {
                            EmployeeId = employee.Id,
                            Year = year,
                            Month = month,
                            AbsenceDays = absenceDays,
                            AdjustmentPercentage = adjustmentPercentage,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }

                await dbContext.AbsenceRecords.AddRangeAsync(absenceRecords);
                await dbContext.SaveChangesAsync();

                logger.LogInformation("Successfully seeded {Count} absence records for {EmployeeCount} employees over 6 months", 
                    absenceRecords.Count, employees.Count);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error seeding absence records");
                throw;
            }
        }

        private static int GenerateRealisticAbsenceDays(Random random, Employee employee, int monthOffset)
        {
            // Base absence probability based on different factors
            double baseAbsenceProbability = 0.1; // 10% chance of any absence
            
            // Adjust based on employee tenure (newer employees might have more absences)
            var yearsOfService = DateTime.UtcNow.Year - (employee.HiringDate?.Year ?? DateTime.UtcNow.Year);
            if (yearsOfService < 1) baseAbsenceProbability += 0.05;
            
            // Seasonal adjustments (winter months have higher absence rates)
            var targetMonth = DateTime.UtcNow.AddMonths(-monthOffset).Month;
            if (targetMonth >= 11 || targetMonth <= 2) // Nov-Feb (winter)
                baseAbsenceProbability += 0.05;
            
            // Generate absence pattern
            if (random.NextDouble() > baseAbsenceProbability)
                return 0; // No absences
            
            // If there are absences, determine how many
            var absenceDistribution = random.NextDouble();
            if (absenceDistribution < 0.5) return 1;      // 50% chance of 1 day
            if (absenceDistribution < 0.75) return 2;     // 25% chance of 2 days
            if (absenceDistribution < 0.9) return 3;      // 15% chance of 3 days
            if (absenceDistribution < 0.97) return random.Next(4, 6); // 7% chance of 4-5 days
            return random.Next(6, 11);                    // 3% chance of 6-10 days (sick leave, etc.)
        }

        private static decimal? CalculateAdjustmentPercentage(int absenceDays, List<AbsenceThreshold> thresholds)
        {
            foreach (var threshold in thresholds)
            {
                bool isMatch = absenceDays >= threshold.MinAbsenceDays &&
                              (threshold.MaxAbsenceDays == null || absenceDays <= threshold.MaxAbsenceDays);
                
                if (isMatch)
                {
                    return threshold.AdjustmentPercentage;
                }
            }
            
            // If no threshold matches, return null (no adjustment)
            return null;
        }
    }
} 