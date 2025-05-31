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

                // Seed job grades (prerequisite for employees)
                await JobGradeSeeder.SeedJobGradesAsync(serviceProvider);
                logger.LogInformation("Job grades seeded successfully.");

                // Seed departments (prerequisite for employees)
                await DepartmentSeeder.SeedDepartmentsAsync(serviceProvider);
                logger.LogInformation("Departments seeded successfully.");

                // Seed service brackets (used for payroll calculations)
                await ServiceBracketSeeder.SeedServiceBracketsAsync(serviceProvider);
                logger.LogInformation("Service brackets seeded successfully.");

                // Seed absence thresholds (used for attendance adjustments)
                await AbsenceThresholdSeeder.SeedAbsenceThresholdsAsync(serviceProvider);
                logger.LogInformation("Absence thresholds seeded successfully.");

                // Seed employees (requires departments and job grades)
                await EmployeeSeeder.SeedEmployeesAsync(serviceProvider);
                logger.LogInformation("Employees seeded successfully.");

                // Seed salary records (requires employees)
                await SalaryRecordSeeder.SeedSalaryRecordsAsync(serviceProvider);
                logger.LogInformation("Salary records seeded successfully.");

                // Seed absence records (requires employees and absence thresholds)
                await AbsenceRecordSeeder.SeedAbsenceRecordsAsync(serviceProvider);
                logger.LogInformation("Absence records seeded successfully.");

                // Seed incentives (requires employees)
                await IncentiveSeeder.SeedIncentivesAsync(serviceProvider);
                logger.LogInformation("Incentives seeded successfully.");

                // Seed payroll snapshots (requires all above data)
                await PayrollSnapshotSeeder.SeedPayrollSnapshotsAsync(serviceProvider);
                logger.LogInformation("Payroll snapshots seeded successfully.");

                logger.LogInformation("Database initialization completed successfully with comprehensive test data.");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while initializing the database.");
                throw;
            }
        }
    }
} 