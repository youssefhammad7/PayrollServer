using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using PayrollServer.Application.DTOs.Request;
using PayrollServer.Application.Features.AbsenceRecord.Requests;
using PayrollServer.Application.Features.AbsenceRecord.Validators;
using PayrollServer.Application.Features.AbsenceThreshold.Requests;
using PayrollServer.Application.Features.AbsenceThreshold.Validators;
using PayrollServer.Application.Features.Department.Requests;
using PayrollServer.Application.Features.Department.Validators;
using PayrollServer.Application.Features.Employee.Requests;
using PayrollServer.Application.Features.Employee.Validators;
using PayrollServer.Application.Features.Incentive.Requests;
using PayrollServer.Application.Features.Incentive.Validators;
using PayrollServer.Application.Features.JobGrade.Requests;
using PayrollServer.Application.Features.JobGrade.Validators;
using PayrollServer.Application.Features.SalaryRecord.Requests;
using PayrollServer.Application.Features.SalaryRecord.Validators;
using PayrollServer.Application.Features.ServiceBracket.Requests;
using PayrollServer.Application.Features.ServiceBracket.Validators;
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

            // Register Domain Services
            services.AddScoped<IDepartmentService, DepartmentService>();
            services.AddScoped<IJobGradeService, JobGradeService>();
            services.AddScoped<IEmployeeService, EmployeeService>();
            services.AddScoped<ISalaryRecordService, SalaryRecordService>();
            services.AddScoped<IIncentiveService, IncentiveService>();
            services.AddScoped<IServiceBracketService, ServiceBracketService>();
            services.AddScoped<IAbsenceRecordService, AbsenceRecordService>();
            services.AddScoped<IAbsenceThresholdService, AbsenceThresholdService>();
            services.AddScoped<IPayrollCalculationService, PayrollCalculationService>();
            services.AddScoped<IReportingService, ReportingService>();

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
            
            // Employee validators
            services.AddScoped<IValidator<CreateEmployeeRequest>, CreateEmployeeValidator>();
            services.AddScoped<IValidator<UpdateEmployeeRequest>, UpdateEmployeeValidator>();
            
            // SalaryRecord validators
            services.AddScoped<IValidator<CreateSalaryRecordRequest>, CreateSalaryRecordValidator>();
            services.AddScoped<IValidator<UpdateSalaryRecordRequest>, UpdateSalaryRecordValidator>();
            
            // Incentive validators
            services.AddScoped<IValidator<CreateIncentiveRequest>, CreateIncentiveValidator>();
            services.AddScoped<IValidator<UpdateIncentiveRequest>, UpdateIncentiveValidator>();
            
            // ServiceBracket validators
            services.AddScoped<IValidator<CreateServiceBracketRequest>, CreateServiceBracketValidator>();
            services.AddScoped<UpdateServiceBracketValidator>();
            
            // AbsenceRecord validators
            services.AddScoped<IValidator<CreateAbsenceRecordRequest>, CreateAbsenceRecordValidator>();
            services.AddScoped<IValidator<UpdateAbsenceRecordRequest>, UpdateAbsenceRecordValidator>();
            
            // AbsenceThreshold validators
            services.AddScoped<IValidator<CreateAbsenceThresholdRequest>, CreateAbsenceThresholdValidator>();
            services.AddScoped<UpdateAbsenceThresholdValidator>();

            return services;
        }
    }
} 