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
    public static class DepartmentSeeder
    {
        public static async Task SeedDepartmentsAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

            try
            {
                // Check if departments already exist
                var existingDepartments = await dbContext.Departments.Where(d => !d.IsDeleted).CountAsync();
                if (existingDepartments > 0)
                {
                    logger.LogInformation("Departments already exist. Skipping seeding.");
                    return;
                }

                var departments = new[]
                {
                    new Department
                    {
                        Name = "Human Resources",
                        IncentivePercentage = 8.5m,
                        IncentiveSetDate = DateTime.UtcNow.AddDays(-60),
                        CreatedAt = DateTime.UtcNow
                    },
                    new Department
                    {
                        Name = "Information Technology",
                        IncentivePercentage = 12.0m,
                        IncentiveSetDate = DateTime.UtcNow.AddDays(-45),
                        CreatedAt = DateTime.UtcNow
                    },
                    new Department
                    {
                        Name = "Finance",
                        IncentivePercentage = 10.0m,
                        IncentiveSetDate = DateTime.UtcNow.AddDays(-30),
                        CreatedAt = DateTime.UtcNow
                    },
                    new Department
                    {
                        Name = "Sales",
                        IncentivePercentage = 15.0m,
                        IncentiveSetDate = DateTime.UtcNow.AddDays(-20),
                        CreatedAt = DateTime.UtcNow
                    },
                    new Department
                    {
                        Name = "Marketing",
                        IncentivePercentage = 9.0m,
                        IncentiveSetDate = DateTime.UtcNow.AddDays(-25),
                        CreatedAt = DateTime.UtcNow
                    },
                    new Department
                    {
                        Name = "Operations",
                        IncentivePercentage = 7.5m,
                        IncentiveSetDate = DateTime.UtcNow.AddDays(-40),
                        CreatedAt = DateTime.UtcNow
                    },
                    new Department
                    {
                        Name = "Customer Service",
                        IncentivePercentage = 6.0m,
                        IncentiveSetDate = DateTime.UtcNow.AddDays(-35),
                        CreatedAt = DateTime.UtcNow
                    }
                };

                await dbContext.Departments.AddRangeAsync(departments);
                await dbContext.SaveChangesAsync();

                logger.LogInformation("Successfully seeded {Count} departments", departments.Length);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error seeding departments");
                throw;
            }
        }
    }
} 