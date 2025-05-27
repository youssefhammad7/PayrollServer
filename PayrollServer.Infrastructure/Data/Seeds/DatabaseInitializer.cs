using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PayrollServer.Infrastructure.Data.Context;
using PayrollServer.Infrastructure.Identity.Seeds;
using System;
using System.Threading.Tasks;

namespace PayrollServer.Infrastructure.Data.Seeds
{
    public static class DatabaseInitializer
    {
        public static async Task InitializeDatabaseAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var services = scope.ServiceProvider;
            var logger = services.GetRequiredService<ILogger<ApplicationDbContext>>();

            try
            {
                // Apply migrations
                var dbContext = services.GetRequiredService<ApplicationDbContext>();
                await dbContext.Database.MigrateAsync();
                logger.LogInformation("Database migrations applied successfully.");

                // Seed roles
                await RoleSeeder.SeedRolesAsync(serviceProvider);
                logger.LogInformation("Roles seeded successfully.");

                // Seed default admin user
                await DefaultAdminSeeder.SeedDefaultAdminAsync(serviceProvider);
                logger.LogInformation("Default admin user seeded successfully.");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while initializing the database.");
                throw;
            }
        }
    }
} 