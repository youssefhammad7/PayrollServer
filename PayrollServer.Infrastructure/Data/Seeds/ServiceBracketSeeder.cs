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
    public static class ServiceBracketSeeder
    {
        public static async Task SeedServiceBracketsAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

            try
            {
                // Check if service brackets already exist
                var existingBrackets = await dbContext.ServiceBrackets.Where(s => !s.IsDeleted).CountAsync();
                if (existingBrackets > 0)
                {
                    logger.LogInformation("Service brackets already exist. Skipping seeding.");
                    return;
                }

                var serviceBrackets = new[]
                {
                    new ServiceBracket
                    {
                        Name = "New Employee",
                        MinYearsOfService = 0,
                        MaxYearsOfService = 1,
                        IncentivePercentage = 0.0m,
                        Description = "First year of employment - no service incentive",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new ServiceBracket
                    {
                        Name = "Early Career",
                        MinYearsOfService = 1,
                        MaxYearsOfService = 3,
                        IncentivePercentage = 2.0m,
                        Description = "1-3 years of service - 2% incentive",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new ServiceBracket
                    {
                        Name = "Established Employee",
                        MinYearsOfService = 3,
                        MaxYearsOfService = 5,
                        IncentivePercentage = 4.0m,
                        Description = "3-5 years of service - 4% incentive",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new ServiceBracket
                    {
                        Name = "Experienced Professional",
                        MinYearsOfService = 5,
                        MaxYearsOfService = 10,
                        IncentivePercentage = 6.0m,
                        Description = "5-10 years of service - 6% incentive",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new ServiceBracket
                    {
                        Name = "Senior Professional",
                        MinYearsOfService = 10,
                        MaxYearsOfService = 15,
                        IncentivePercentage = 8.0m,
                        Description = "10-15 years of service - 8% incentive",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new ServiceBracket
                    {
                        Name = "Veteran Employee",
                        MinYearsOfService = 15,
                        MaxYearsOfService = null, // No upper limit
                        IncentivePercentage = 10.0m,
                        Description = "15+ years of service - 10% incentive",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    }
                };

                await dbContext.ServiceBrackets.AddRangeAsync(serviceBrackets);
                await dbContext.SaveChangesAsync();

                logger.LogInformation("Successfully seeded {Count} service brackets", serviceBrackets.Length);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error seeding service brackets");
                throw;
            }
        }
    }
} 