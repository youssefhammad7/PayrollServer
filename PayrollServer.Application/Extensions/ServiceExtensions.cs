using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using PayrollServer.Application.DTOs.Request;
using PayrollServer.Application.Features.Department.Requests;
using PayrollServer.Application.Features.Department.Validators;
using PayrollServer.Application.Features.JobGrade.Requests;
using PayrollServer.Application.Features.JobGrade.Validators;
using PayrollServer.Application.Interfaces.Services;
using PayrollServer.Application.Services;
using PayrollServer.Application.Validators;
using System;
using System.Reflection;

namespace PayrollServer.Application.Extensions
{
    public static class ServiceExtensions
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            // Register AutoMapper
            services.AddAutoMapper(Assembly.GetExecutingAssembly());

            // Register FluentValidation
            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

            // Register Identity Services
            // services.AddScoped<IIdentityService, IdentityService>();

            // Register Department and JobGrade Services
            services.AddScoped<IDepartmentService, DepartmentService>();
            services.AddScoped<IJobGradeService, JobGradeService>();

            // Register specific validators
            // TODO: Uncomment these once the validators are implemented
            //services.AddScoped<IValidator<LoginRequest>, LoginRequestValidator>();
            //services.AddScoped<IValidator<RegisterRequest>, RegisterRequestValidator>();
            //services.AddScoped<IValidator<UpdatePasswordRequest>, UpdatePasswordValidator>();
            //services.AddScoped<IValidator<UpdateUserRequest>, UpdateUserValidator>();
            //services.AddScoped<IValidator<CreateRoleRequest>, CreateRoleRequestValidator>();
            
            // Department validators
            services.AddScoped<IValidator<CreateDepartmentRequest>, CreateDepartmentValidator>();
            services.AddScoped<IValidator<UpdateDepartmentRequest>, UpdateDepartmentValidator>();
            services.AddScoped<IValidator<UpdateDepartmentIncentiveRequest>, UpdateDepartmentIncentiveValidator>();
            
            // JobGrade validators
            services.AddScoped<IValidator<CreateJobGradeRequest>, CreateJobGradeValidator>();
            services.AddScoped<IValidator<UpdateJobGradeRequest>, UpdateJobGradeValidator>();

            return services;
        }
    }
} 