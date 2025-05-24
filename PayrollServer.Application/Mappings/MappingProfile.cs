using AutoMapper;
using PayrollServer.Application.DTOs.Response;
using PayrollServer.Application.DTOs.Department;
using PayrollServer.Application.DTOs.Employee;
using PayrollServer.Application.DTOs.JobGrade;
using PayrollServer.Application.Features.Department.Requests;
using PayrollServer.Application.Features.Employee.Requests;
using PayrollServer.Application.Features.JobGrade.Requests;
using PayrollServer.Domain.Entities;
using System.Linq;

namespace PayrollServer.Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User mappings
            CreateMap<ApplicationUser, UserDto>()
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.UserName));

            // Role mappings
            CreateMap<ApplicationRole, RoleDto>();

            // Department mappings
            CreateMap<Department, DepartmentDto>()
                .ForMember(dest => dest.EmployeeCount, opt => opt.MapFrom(src => src.Employees.Count));
                
            CreateMap<CreateDepartmentRequest, Department>();
            CreateMap<UpdateDepartmentRequest, Department>();
            
            // DepartmentIncentiveHistory mappings
            CreateMap<DepartmentIncentiveHistory, DepartmentIncentiveHistoryDto>()
                .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department.Name));
                
            // JobGrade mappings
            CreateMap<JobGrade, JobGradeDto>()
                .ForMember(dest => dest.EmployeeCount, opt => opt.MapFrom(src => src.Employees.Count));
                
            CreateMap<CreateJobGradeRequest, JobGrade>();
            CreateMap<UpdateJobGradeRequest, JobGrade>();
            
            // Employee mappings
            CreateMap<Employee, EmployeeDto>()
                .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department.Name))
                .ForMember(dest => dest.DepartmentIncentivePercentage, opt => opt.MapFrom(src => src.Department.IncentivePercentage))
                .ForMember(dest => dest.JobGradeName, opt => opt.MapFrom(src => src.JobGrade.Name))
                .ForMember(dest => dest.JobGradeMinSalary, opt => opt.MapFrom(src => src.JobGrade.MinSalary))
                .ForMember(dest => dest.JobGradeMaxSalary, opt => opt.MapFrom(src => src.JobGrade.MaxSalary))
                .ForMember(dest => dest.CurrentSalary, opt => opt.MapFrom(src => 
                    src.SalaryRecords != null && src.SalaryRecords.Any() 
                    ? src.SalaryRecords.OrderByDescending(s => s.EffectiveDate).FirstOrDefault().BaseSalary 
                    : (decimal?)null))
                .ForMember(dest => dest.SalaryEffectiveDate, opt => opt.MapFrom(src => 
                    src.SalaryRecords != null && src.SalaryRecords.Any()
                    ? src.SalaryRecords.OrderByDescending(s => s.EffectiveDate).FirstOrDefault().EffectiveDate
                    : (DateTime?)null));
                
            CreateMap<CreateEmployeeRequest, Employee>();
            CreateMap<UpdateEmployeeRequest, Employee>();
        }
    }
} 