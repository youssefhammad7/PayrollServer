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
    public static class EmployeeSeeder
    {
        public static async Task SeedEmployeesAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

            try
            {
                // Check if employees already exist
                var existingEmployees = await dbContext.Employees.Where(e => !e.IsDeleted).CountAsync();
                if (existingEmployees > 0)
                {
                    logger.LogInformation("Employees already exist. Skipping seeding.");
                    return;
                }

                // Get departments and job grades
                var departments = await dbContext.Departments.Where(d => !d.IsDeleted).ToListAsync();
                var jobGrades = await dbContext.JobGrades.Where(j => !j.IsDeleted).ToListAsync();

                if (!departments.Any() || !jobGrades.Any())
                {
                    logger.LogWarning("Departments or JobGrades not found. Please seed them first.");
                    return;
                }

                var hrDept = departments.First(d => d.Name == "Human Resources");
                var itDept = departments.First(d => d.Name == "Information Technology");
                var financeDept = departments.First(d => d.Name == "Finance");
                var salesDept = departments.First(d => d.Name == "Sales");
                var marketingDept = departments.First(d => d.Name == "Marketing");
                var operationsDept = departments.First(d => d.Name == "Operations");
                var csDept = departments.First(d => d.Name == "Customer Service");

                var firstGrade = jobGrades.First(j => j.Name == "First");
                var secondGrade = jobGrades.First(j => j.Name == "Second");
                var thirdGrade = jobGrades.First(j => j.Name == "Third");

                var employees = new[]
                {
                    // HR Department
                    new Employee
                    {
                        EmployeeNumber = "EMP001",
                        FirstName = "Sarah",
                        LastName = "Johnson",
                        DateOfBirth = new DateTime(1985, 3, 15),
                        Address = "123 Main St, Downtown, City 12345",
                        PhoneNumber = "+1-555-0101",
                        Email = "sarah.johnson@company.com",
                        HiringDate = new DateTime(2018, 1, 15),
                        Status = "Active",
                        DepartmentId = hrDept.Id,
                        JobGradeId = thirdGrade.Id,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Employee
                    {
                        EmployeeNumber = "EMP002",
                        FirstName = "Michael",
                        LastName = "Chen",
                        DateOfBirth = new DateTime(1990, 7, 22),
                        Address = "456 Oak Ave, Suburbia, City 12346",
                        PhoneNumber = "+1-555-0102",
                        Email = "michael.chen@company.com",
                        HiringDate = new DateTime(2020, 6, 1),
                        Status = "Active",
                        DepartmentId = hrDept.Id,
                        JobGradeId = secondGrade.Id,
                        CreatedAt = DateTime.UtcNow
                    },

                    // IT Department
                    new Employee
                    {
                        EmployeeNumber = "EMP003",
                        FirstName = "Emily",
                        LastName = "Rodriguez",
                        DateOfBirth = new DateTime(1988, 11, 8),
                        Address = "789 Tech Blvd, Innovation District, City 12347",
                        PhoneNumber = "+1-555-0103",
                        Email = "emily.rodriguez@company.com",
                        HiringDate = new DateTime(2017, 3, 20),
                        Status = "Active",
                        DepartmentId = itDept.Id,
                        JobGradeId = thirdGrade.Id,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Employee
                    {
                        EmployeeNumber = "EMP004",
                        FirstName = "David",
                        LastName = "Kim",
                        DateOfBirth = new DateTime(1992, 5, 14),
                        Address = "321 Code St, Developer Heights, City 12348",
                        PhoneNumber = "+1-555-0104",
                        Email = "david.kim@company.com",
                        HiringDate = new DateTime(2021, 9, 15),
                        Status = "Active",
                        DepartmentId = itDept.Id,
                        JobGradeId = secondGrade.Id,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Employee
                    {
                        EmployeeNumber = "EMP005",
                        FirstName = "Jessica",
                        LastName = "Taylor",
                        DateOfBirth = new DateTime(1995, 2, 28),
                        Address = "654 Binary Ave, Tech Valley, City 12349",
                        PhoneNumber = "+1-555-0105",
                        Email = "jessica.taylor@company.com",
                        HiringDate = new DateTime(2023, 4, 10),
                        Status = "Active",
                        DepartmentId = itDept.Id,
                        JobGradeId = firstGrade.Id,
                        CreatedAt = DateTime.UtcNow
                    },

                    // Finance Department
                    new Employee
                    {
                        EmployeeNumber = "EMP006",
                        FirstName = "Robert",
                        LastName = "Williams",
                        DateOfBirth = new DateTime(1983, 9, 5),
                        Address = "987 Finance Way, Business District, City 12350",
                        PhoneNumber = "+1-555-0106",
                        Email = "robert.williams@company.com",
                        HiringDate = new DateTime(2015, 8, 1),
                        Status = "Active",
                        DepartmentId = financeDept.Id,
                        JobGradeId = thirdGrade.Id,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Employee
                    {
                        EmployeeNumber = "EMP007",
                        FirstName = "Amanda",
                        LastName = "Brown",
                        DateOfBirth = new DateTime(1991, 12, 18),
                        Address = "147 Accounting Rd, Financial Square, City 12351",
                        PhoneNumber = "+1-555-0107",
                        Email = "amanda.brown@company.com",
                        HiringDate = new DateTime(2019, 11, 12),
                        Status = "Active",
                        DepartmentId = financeDept.Id,
                        JobGradeId = secondGrade.Id,
                        CreatedAt = DateTime.UtcNow
                    },

                    // Sales Department
                    new Employee
                    {
                        EmployeeNumber = "EMP008",
                        FirstName = "James",
                        LastName = "Davis",
                        DateOfBirth = new DateTime(1987, 4, 12),
                        Address = "258 Sales Dr, Commerce Center, City 12352",
                        PhoneNumber = "+1-555-0108",
                        Email = "james.davis@company.com",
                        HiringDate = new DateTime(2016, 5, 18),
                        Status = "Active",
                        DepartmentId = salesDept.Id,
                        JobGradeId = thirdGrade.Id,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Employee
                    {
                        EmployeeNumber = "EMP009",
                        FirstName = "Lisa",
                        LastName = "Garcia",
                        DateOfBirth = new DateTime(1993, 8, 25),
                        Address = "369 Revenue Rd, Sales Plaza, City 12353",
                        PhoneNumber = "+1-555-0109",
                        Email = "lisa.garcia@company.com",
                        HiringDate = new DateTime(2021, 2, 8),
                        Status = "Active",
                        DepartmentId = salesDept.Id,
                        JobGradeId = secondGrade.Id,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Employee
                    {
                        EmployeeNumber = "EMP010",
                        FirstName = "Thomas",
                        LastName = "Miller",
                        DateOfBirth = new DateTime(1994, 10, 3),
                        Address = "741 Deal St, Sales Junction, City 12354",
                        PhoneNumber = "+1-555-0110",
                        Email = "thomas.miller@company.com",
                        HiringDate = new DateTime(2022, 7, 25),
                        Status = "Active",
                        DepartmentId = salesDept.Id,
                        JobGradeId = firstGrade.Id,
                        CreatedAt = DateTime.UtcNow
                    },

                    // Marketing Department
                    new Employee
                    {
                        EmployeeNumber = "EMP011",
                        FirstName = "Jennifer",
                        LastName = "Wilson",
                        DateOfBirth = new DateTime(1989, 6, 17),
                        Address = "852 Creative Ave, Marketing Hub, City 12355",
                        PhoneNumber = "+1-555-0111",
                        Email = "jennifer.wilson@company.com",
                        HiringDate = new DateTime(2018, 10, 3),
                        Status = "Active",
                        DepartmentId = marketingDept.Id,
                        JobGradeId = thirdGrade.Id,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Employee
                    {
                        EmployeeNumber = "EMP012",
                        FirstName = "Kevin",
                        LastName = "Moore",
                        DateOfBirth = new DateTime(1992, 1, 30),
                        Address = "963 Brand Blvd, Campaign City, City 12356",
                        PhoneNumber = "+1-555-0112",
                        Email = "kevin.moore@company.com",
                        HiringDate = new DateTime(2020, 12, 14),
                        Status = "Active",
                        DepartmentId = marketingDept.Id,
                        JobGradeId = secondGrade.Id,
                        CreatedAt = DateTime.UtcNow
                    },

                    // Operations Department
                    new Employee
                    {
                        EmployeeNumber = "EMP013",
                        FirstName = "Michelle",
                        LastName = "Anderson",
                        DateOfBirth = new DateTime(1986, 8, 11),
                        Address = "159 Operations Way, Process Center, City 12357",
                        PhoneNumber = "+1-555-0113",
                        Email = "michelle.anderson@company.com",
                        HiringDate = new DateTime(2017, 1, 9),
                        Status = "Active",
                        DepartmentId = operationsDept.Id,
                        JobGradeId = thirdGrade.Id,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Employee
                    {
                        EmployeeNumber = "EMP014",
                        FirstName = "Christopher",
                        LastName = "Thompson",
                        DateOfBirth = new DateTime(1991, 11, 26),
                        Address = "267 Efficiency Dr, Operations Valley, City 12358",
                        PhoneNumber = "+1-555-0114",
                        Email = "christopher.thompson@company.com",
                        HiringDate = new DateTime(2019, 8, 22),
                        Status = "Active",
                        DepartmentId = operationsDept.Id,
                        JobGradeId = secondGrade.Id,
                        CreatedAt = DateTime.UtcNow
                    },

                    // Customer Service Department
                    new Employee
                    {
                        EmployeeNumber = "EMP015",
                        FirstName = "Nicole",
                        LastName = "White",
                        DateOfBirth = new DateTime(1990, 4, 19),
                        Address = "375 Service St, Support Square, City 12359",
                        PhoneNumber = "+1-555-0115",
                        Email = "nicole.white@company.com",
                        HiringDate = new DateTime(2020, 3, 16),
                        Status = "Active",
                        DepartmentId = csDept.Id,
                        JobGradeId = secondGrade.Id,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Employee
                    {
                        EmployeeNumber = "EMP016",
                        FirstName = "Ryan",
                        LastName = "Harris",
                        DateOfBirth = new DateTime(1993, 12, 7),
                        Address = "486 Help Desk Ave, Customer Care City, City 12360",
                        PhoneNumber = "+1-555-0116",
                        Email = "ryan.harris@company.com",
                        HiringDate = new DateTime(2022, 1, 11),
                        Status = "Active",
                        DepartmentId = csDept.Id,
                        JobGradeId = firstGrade.Id,
                        CreatedAt = DateTime.UtcNow
                    }
                };

                await dbContext.Employees.AddRangeAsync(employees);
                await dbContext.SaveChangesAsync();

                logger.LogInformation("Successfully seeded {Count} employees", employees.Length);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error seeding employees");
                throw;
            }
        }
    }
} 