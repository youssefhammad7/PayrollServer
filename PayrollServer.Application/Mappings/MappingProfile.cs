using AutoMapper;
using PayrollServer.Application.DTOs.Response;
using PayrollServer.Application.DTOs.Department;
using PayrollServer.Application.DTOs.Employee;
using PayrollServer.Application.DTOs.Incentive;
using PayrollServer.Application.DTOs.JobGrade;
using PayrollServer.Application.DTOs.Report;
using PayrollServer.Application.DTOs.SalaryRecord;
using PayrollServer.Application.Features.Department.Requests;
using PayrollServer.Application.Features.Employee.Requests;
using PayrollServer.Application.Features.Incentive.Requests;
using PayrollServer.Application.Features.JobGrade.Requests;
using PayrollServer.Application.Features.SalaryRecord.Requests;
using PayrollServer.Domain.Entities;
using System.Linq;
using PayrollServer.Application.DTOs.ServiceBracket;
using PayrollServer.Application.Features.ServiceBracket.Requests;
using PayrollServer.Application.DTOs.AbsenceRecord;
using PayrollServer.Application.DTOs.AbsenceThreshold;
using PayrollServer.Application.DTOs.PayrollSnapshot;
using PayrollServer.Application.Features.AbsenceRecord.Requests;
using PayrollServer.Application.Features.AbsenceThreshold.Requests;

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
                .ForMember(dest => dest.EmployeeCount, opt => opt.Ignore());
                
            CreateMap<CreateDepartmentRequest, Department>();
            CreateMap<UpdateDepartmentRequest, Department>();
            
            // DepartmentIncentiveHistory mappings
            CreateMap<DepartmentIncentiveHistory, DepartmentIncentiveHistoryDto>()
                .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department.Name));
                
            // JobGrade mappings
            CreateMap<JobGrade, JobGradeDto>()
                .ForMember(dest => dest.EmployeeCount, opt => opt.Ignore());
                
            CreateMap<CreateJobGradeRequest, JobGrade>();
            CreateMap<UpdateJobGradeRequest, JobGrade>();
            
            // Employee mappings
            CreateMap<Employee, EmployeeDto>()
                .ForMember(dest => dest.EmployeeNumber, opt => opt.MapFrom(src => src.EmployeeNumber))
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
                    : (System.DateTime?)null));
                
            CreateMap<CreateEmployeeRequest, Employee>()
                .ForMember(dest => dest.EmployeeNumber, opt => opt.MapFrom(src => src.EmployeeId))
                .ForMember(dest => dest.HiringDate, opt => opt.MapFrom(src => src.HireDate));
            CreateMap<UpdateEmployeeRequest, Employee>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.EmploymentStatus));
            
            // SalaryRecord mappings
            CreateMap<SalaryRecord, SalaryRecordDto>()
                .ForMember(dest => dest.EmployeeName, opt => opt.Ignore())
                .ForMember(dest => dest.EmployeeNumber, opt => opt.Ignore());
                
            CreateMap<CreateSalaryRecordRequest, SalaryRecord>();
            CreateMap<UpdateSalaryRecordRequest, SalaryRecord>();
            
            // Incentive mappings
            CreateMap<Incentive, IncentiveDto>()
                .ForMember(dest => dest.EmployeeName, opt => opt.Ignore())
                .ForMember(dest => dest.EmployeeNumber, opt => opt.Ignore());
                
            CreateMap<CreateIncentiveRequest, Incentive>();
            CreateMap<UpdateIncentiveRequest, Incentive>();
            
            // ServiceBracket mappings
            CreateMap<ServiceBracket, ServiceBracketDto>();
            CreateMap<CreateServiceBracketRequest, ServiceBracket>();
            CreateMap<UpdateServiceBracketRequest, ServiceBracket>();
            
            // AbsenceRecord mappings
            CreateMap<AbsenceRecord, AbsenceRecordDto>()
                .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => 
                    $"{src.Employee.FirstName} {src.Employee.LastName}"));
            CreateMap<CreateAbsenceRecordRequest, AbsenceRecord>();
            CreateMap<UpdateAbsenceRecordRequest, AbsenceRecord>();
            
            // AbsenceThreshold mappings
            CreateMap<AbsenceThreshold, AbsenceThresholdDto>();
            CreateMap<CreateAbsenceThresholdRequest, AbsenceThreshold>();
            CreateMap<UpdateAbsenceThresholdRequest, AbsenceThreshold>();
            
            // PayrollSnapshot mappings
            CreateMap<PayrollSnapshot, PayrollSnapshotDto>()
                .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => 
                    src.Employee != null ? $"{src.Employee.FirstName} {src.Employee.LastName}" : string.Empty))
                .ForMember(dest => dest.EmployeeNumber, opt => opt.MapFrom(src => 
                    src.Employee != null ? src.Employee.EmployeeNumber : string.Empty))
                .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => 
                    src.Employee != null && src.Employee.Department != null ? src.Employee.Department.Name : string.Empty))
                .ForMember(dest => dest.JobGradeName, opt => opt.MapFrom(src => 
                    src.Employee != null && src.Employee.JobGrade != null ? src.Employee.JobGrade.Name : string.Empty));
            
            CreateMap<PayrollSnapshotDto, PayrollSnapshot>()
                .ForMember(dest => dest.Employee, opt => opt.Ignore())
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore());
                
            // Report mappings
            CreateMap<AbsenceRecord, AttendanceReportDto>()
                .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => 
                    $"{src.Employee.FirstName} {src.Employee.LastName}"))
                .ForMember(dest => dest.EmployeeNumber, opt => opt.MapFrom(src => 
                    src.Employee.EmployeeNumber))
                .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => 
                    src.Employee.Department.Name))
                .ForMember(dest => dest.AdjustmentAmount, opt => opt.Ignore())
                .ForMember(dest => dest.LastUpdated, opt => opt.MapFrom(src => 
                    src.UpdatedAt ?? src.CreatedAt));
                
            CreateMap<PayrollSnapshot, IncentiveReportDto>()
                .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => 
                    $"{src.Employee.FirstName} {src.Employee.LastName}"))
                .ForMember(dest => dest.EmployeeNumber, opt => opt.MapFrom(src => 
                    src.Employee.EmployeeNumber))
                .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => 
                    src.Employee.Department.Name));
                
            CreateMap<Employee, EmployeeDirectoryDto>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => 
                    $"{src.FirstName} {src.LastName}"))
                .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => 
                    src.Department.Name))
                .ForMember(dest => dest.JobGradeName, opt => opt.MapFrom(src => 
                    src.JobGrade.Name))
                .ForMember(dest => dest.YearsOfService, opt => opt.Ignore());
                
            CreateMap<PayrollSnapshot, SalaryReportDto>()
                .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => 
                    $"{src.Employee.FirstName} {src.Employee.LastName}"))
                .ForMember(dest => dest.EmployeeNumber, opt => opt.MapFrom(src => 
                    src.Employee.EmployeeNumber))
                .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => 
                    src.Employee.Department.Name))
                .ForMember(dest => dest.JobGradeName, opt => opt.MapFrom(src => 
                    src.Employee.JobGrade.Name))
                .ForMember(dest => dest.HasPayrollRecord, opt => opt.MapFrom(src => true));
        }
    }
} 