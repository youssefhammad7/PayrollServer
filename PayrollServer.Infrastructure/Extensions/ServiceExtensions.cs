using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using PayrollServer.Domain.Entities;
using PayrollServer.Domain.Interfaces.Repositories;
using PayrollServer.Infrastructure.Data.Context;
using PayrollServer.Infrastructure.Identity.Interfaces;
using PayrollServer.Infrastructure.Identity.Services;
using PayrollServer.Infrastructure.Logging;
using PayrollServer.Infrastructure.Repositories;
using PayrollServer.Infrastructure.Services.Email;
using Serilog;
using System;
using System.Text;

namespace PayrollServer.Infrastructure.Extensions
{
    public static class ServiceExtensions
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            try
            {
                // Configure DbContext
                var connectionString = configuration.GetConnectionString("DefaultConnection")
                    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
                    
                services.AddDbContext<ApplicationDbContext>(options =>
                    options.UseSqlServer(
                        connectionString,
                        b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

                // Configure Identity
                services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
                {
                    options.Password.RequiredLength = 8;
                    options.Password.RequireDigit = true;
                    options.Password.RequireLowercase = true;
                    options.Password.RequireUppercase = true;
                    options.Password.RequireNonAlphanumeric = true;
                    options.User.RequireUniqueEmail = true;
                    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
                    options.Lockout.MaxFailedAccessAttempts = 5;
                    // Email confirmation disabled for development
                    options.SignIn.RequireConfirmedEmail = false;
                })
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

                // Configure JWT Authentication
                var jwtKey = configuration["JwtSettings:Key"] 
                    ?? throw new InvalidOperationException("JWT Key not found in configuration.");
                    
                services.AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = configuration["JwtSettings:Issuer"],
                        ValidAudience = configuration["JwtSettings:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(jwtKey))
                    };
                });

                // Configure Email Services - commented out for development
                services.AddSingleton<IEmailTemplateService, EmailTemplateService>();
                services.AddScoped<IEmailService, SmtpEmailService>();

                // Configure Identity Services
                services.AddScoped<IIdentityService, IdentityService>();

                // Configure Generic Repository and Unit of Work
                services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
                services.AddScoped<IUnitOfWork, UnitOfWork>();
                
                // Configure Specific Repositories
                services.AddScoped<IDepartmentRepository, DepartmentRepository>();
                services.AddScoped<IJobGradeRepository, JobGradeRepository>();
                services.AddScoped<IEmployeeRepository, EmployeeRepository>();
                services.AddScoped<ISalaryRecordRepository, SalaryRecordRepository>();
                services.AddScoped<IIncentiveRepository, IncentiveRepository>();
                services.AddScoped<IServiceBracketRepository, ServiceBracketRepository>();
                services.AddScoped<IAbsenceRecordRepository, AbsenceRecordRepository>();
                services.AddScoped<IAbsenceThresholdRepository, AbsenceThresholdRepository>();
                services.AddScoped<IPayrollSnapshotRepository, PayrollSnapshotRepository>();

                // Configure Logging
                var logger = LoggerService.CreateLogger(configuration);
                services.AddSingleton(logger);
                services.AddLogging(loggingBuilder => loggingBuilder.AddSerilog(logger, dispose: true));

                return services;
            }
            catch (Exception ex)
            {
                // Using Serilog instead of throwing to avoid crashing the application during startup
                Log.Error(ex, "Error configuring infrastructure services");
                throw; // Rethrow after logging for proper startup error handling
            }
        }
    }
} 