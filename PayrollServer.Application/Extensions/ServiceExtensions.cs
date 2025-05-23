using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using PayrollServer.Application.DTOs.Request;
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

            // Register specific validators
            services.AddScoped<IValidator<UpdateUserRequest>, UpdateUserRequestValidator>();
            services.AddScoped<IValidator<CreateRoleRequest>, CreateRoleRequestValidator>();
            services.AddScoped<IValidator<UpdateRoleRequest>, UpdateRoleRequestValidator>();
            services.AddScoped<IValidator<AddUserToRoleRequest>, AddUserToRoleRequestValidator>();

            // Register Application Services
            // Example: services.AddScoped<IEmployeeService, EmployeeService>();

            return services;
        }
    }
} 