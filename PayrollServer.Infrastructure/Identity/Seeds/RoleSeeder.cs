using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PayrollServer.Domain.Entities;
using PayrollServer.Infrastructure.Identity.Constants;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace PayrollServer.Infrastructure.Identity.Seeds
{
    public static class RoleSeeder
    {
        public static async Task SeedRolesAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationRole>>();

            foreach (var roleName in Roles.All)
            {
                try
                {
                    // Check if role exists
                    var roleExists = await roleManager.RoleExistsAsync(roleName);
                    if (!roleExists)
                    {
                        // Create role with description
                        var role = new ApplicationRole
                        {
                            Name = roleName,
                            Description = Roles.Descriptions.TryGetValue(roleName, out var description)
                                ? description
                                : $"Role for {roleName} users.",
                            NormalizedName = roleName.ToUpper(),
                            CreatedAt = DateTime.UtcNow
                        };

                        var result = await roleManager.CreateAsync(role);
                        if (result.Succeeded)
                        {
                            logger.LogInformation("Created role {Role}", roleName);
                        }
                        else
                        {
                            logger.LogError("Failed to create role {Role}. Errors: {Errors}",
                                roleName, string.Join(", ", result.Errors.Select(e => e.Description)));
                        }
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error seeding role {Role}", roleName);
                }
            }
        }
    }
} 