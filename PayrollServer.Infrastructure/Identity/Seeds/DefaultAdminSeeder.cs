using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PayrollServer.Domain.Entities;
using PayrollServer.Infrastructure.Identity.Constants;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace PayrollServer.Infrastructure.Identity.Seeds
{
    public static class DefaultAdminSeeder
    {
        public static async Task SeedDefaultAdminAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
            var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationUser>>();

            // Get admin user details from configuration or use defaults
            var adminEmail = configuration["DefaultUsers:Admin:Email"] ?? "admin@payrollsystem.com";
            var adminUsername = configuration["DefaultUsers:Admin:Username"] ?? "admin";
            var adminPassword = configuration["DefaultUsers:Admin:Password"] ?? "Admin@123456";
            var adminFirstName = configuration["DefaultUsers:Admin:FirstName"] ?? "System";
            var adminLastName = configuration["DefaultUsers:Admin:LastName"] ?? "Administrator";

            try
            {
                // Check if admin user exists
                var adminUser = await userManager.FindByEmailAsync(adminEmail);
                if (adminUser == null)
                {
                    logger.LogInformation("Admin user not found. Creating new admin user.");

                    // Create admin user
                    adminUser = new ApplicationUser
                    {
                        UserName = adminUsername,
                        Email = adminEmail,
                        FirstName = adminFirstName,
                        LastName = adminLastName,
                        EmailConfirmed = true,
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true
                    };

                    var result = await userManager.CreateAsync(adminUser, adminPassword);
                    if (result.Succeeded)
                    {
                        logger.LogInformation("Created admin user {Email}", adminEmail);

                        // Ensure Admin role exists
                        if (!await roleManager.RoleExistsAsync(Roles.Admin))
                        {
                            logger.LogWarning("Admin role not found. Make sure to run RoleSeeder first.");
                        }
                        else
                        {
                            // Add user to Admin role
                            var roleResult = await userManager.AddToRoleAsync(adminUser, Roles.Admin);
                            if (roleResult.Succeeded)
                            {
                                logger.LogInformation("Added admin user to Admin role");
                            }
                            else
                            {
                                logger.LogError("Failed to add admin user to Admin role. Errors: {Errors}",
                                    string.Join(", ", roleResult.Errors.Select(e => e.Description)));
                            }
                        }
                    }
                    else
                    {
                        logger.LogError("Failed to create admin user. Errors: {Errors}",
                            string.Join(", ", result.Errors.Select(e => e.Description)));
                    }
                }
                else
                {
                    logger.LogInformation("Admin user already exists: {Email}", adminEmail);

                    // Ensure user is in Admin role
                    if (!await userManager.IsInRoleAsync(adminUser, Roles.Admin))
                    {
                        var roleResult = await userManager.AddToRoleAsync(adminUser, Roles.Admin);
                        if (roleResult.Succeeded)
                        {
                            logger.LogInformation("Added existing admin user to Admin role");
                        }
                        else
                        {
                            logger.LogError("Failed to add existing admin user to Admin role. Errors: {Errors}",
                                string.Join(", ", roleResult.Errors.Select(e => e.Description)));
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error seeding admin user");
            }
        }
    }
} 