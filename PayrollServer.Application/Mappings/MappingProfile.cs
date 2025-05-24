using AutoMapper;
using PayrollServer.Application.DTOs.Response;
using PayrollServer.Application.DTOs.Department;
using PayrollServer.Application.DTOs.JobGrade;
using PayrollServer.Application.Features.Department.Requests;
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
        }
    }
} 