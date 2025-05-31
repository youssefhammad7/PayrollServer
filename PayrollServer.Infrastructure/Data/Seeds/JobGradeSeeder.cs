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
    public static class JobGradeSeeder
    {
        public static async Task SeedJobGradesAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

            try
            {
                // Check if job grades already exist
                var existingGrades = await dbContext.JobGrades.Where(j => !j.IsDeleted).CountAsync();
                if (existingGrades > 0)
                {
                    logger.LogInformation("Job grades already exist. Skipping seeding.");
                    return;
                }

                // Define the three preset job grades with default salary ranges
                var jobGrades = new[]
                {
                    new JobGrade
                    {
                        Name = "First",
                        Description = "Entry-level position with basic responsibilities",
                        MinSalary = 30000m,
                        MaxSalary = 50000m,
                        CreatedAt = DateTime.UtcNow
                    },
                    new JobGrade
                    {
                        Name = "Second", 
                        Description = "Mid-level position with moderate responsibilities",
                        MinSalary = 50000m,
                        MaxSalary = 80000m,
                        CreatedAt = DateTime.UtcNow
                    },
                    new JobGrade
                    {
                        Name = "Third",
                        Description = "Senior-level position with high responsibilities",
                        MinSalary = 80000m,
                        MaxSalary = 120000m,
                        CreatedAt = DateTime.UtcNow
                    }
                };

                await dbContext.JobGrades.AddRangeAsync(jobGrades);
                await dbContext.SaveChangesAsync();

                logger.LogInformation("Successfully seeded {Count} job grades", jobGrades.Length);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error seeding job grades");
                throw;
            }
        }
    }
} 