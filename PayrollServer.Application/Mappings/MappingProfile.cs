using AutoMapper;
using PayrollServer.Application.DTOs.Response;
using PayrollServer.Domain.Entities;

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
        }
    }
} 