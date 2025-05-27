using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PayrollServer.Application.DTOs.Request;
using PayrollServer.Application.DTOs.Response;
using PayrollServer.Domain.Entities;
using PayrollServer.Extensions;
using PayrollServer.Infrastructure.Identity.Constants;
using PayrollServer.Infrastructure.Identity.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PayrollServer.Controllers
{
    [Authorize(Roles = "Admin")]
    public class UserManagementController : BaseApiController
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly IIdentityService _identityService;
        private readonly IMapper _mapper;
        private readonly ILogger<UserManagementController> _logger;

        public UserManagementController(
            UserManager<ApplicationUser> userManager,
            RoleManager<ApplicationRole> roleManager,
            IIdentityService identityService,
            IMapper mapper,
            ILogger<UserManagementController> logger)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _identityService = identityService;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var users = await _userManager.Users
                    .Where(u => !u.IsDeleted)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var totalCount = await _userManager.Users.CountAsync(u => !u.IsDeleted);

                var userDtos = new List<UserDto>();
                foreach (var user in users)
                {
                    var roles = await _userManager.GetRolesAsync(user);
                    var userDto = _mapper.Map<UserDto>(user);
                    userDto.Roles = roles.ToList();
                    userDtos.Add(userDto);
                }

                var result = new PaginatedResponse<UserDto>
                {
                    Items = userDtos,
                    PageNumber = page,
                    PageSize = pageSize,
                    TotalCount = totalCount,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                };

                return this.ApiOk(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users");
                return this.ApiServerError(ex);
            }
        }

        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null || user.IsDeleted)
                {
                    return this.ApiNotFound("User not found");
                }

                var roles = await _userManager.GetRolesAsync(user);
                var userDto = _mapper.Map<UserDto>(user);
                userDto.Roles = roles.ToList();

                return this.ApiOk(userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user with ID {UserId}", id);
                return this.ApiServerError(ex);
            }
        }

        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserRequest request)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null || user.IsDeleted)
                {
                    return this.ApiNotFound("User not found");
                }

                // Update user properties
                user.FirstName = request.FirstName;
                user.LastName = request.LastName;
                user.Email = request.Email;
                user.UserName = request.Username;
                user.PhoneNumber = request.PhoneNumber;
                user.IsActive = request.IsActive;
                user.UpdatedAt = DateTime.UtcNow;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    return this.ApiBadRequest(string.Join(", ", result.Errors.Select(e => e.Description)));
                }

                // Update user roles if specified
                if (request.Roles != null && request.Roles.Any())
                {
                    // Get current roles
                    var currentRoles = await _userManager.GetRolesAsync(user);
                    
                    // Remove roles not in the request
                    var rolesToRemove = currentRoles.Except(request.Roles).ToArray();
                    if (rolesToRemove.Any())
                    {
                        await _userManager.RemoveFromRolesAsync(user, rolesToRemove);
                    }
                    
                    // Add roles from the request that the user doesn't have
                    var rolesToAdd = request.Roles.Except(currentRoles).ToArray();
                    if (rolesToAdd.Any())
                    {
                        await _userManager.AddToRolesAsync(user, rolesToAdd);
                    }
                }

                // Get updated user with roles
                var updatedRoles = await _userManager.GetRolesAsync(user);
                var userDto = _mapper.Map<UserDto>(user);
                userDto.Roles = updatedRoles.ToList();

                return this.ApiOk(userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user with ID {UserId}", id);
                return this.ApiServerError(ex);
            }
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null || user.IsDeleted)
                {
                    return this.ApiNotFound("User not found");
                }

                // Soft delete
                user.IsDeleted = true;
                user.UpdatedAt = DateTime.UtcNow;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    return this.ApiBadRequest(string.Join(", ", result.Errors.Select(e => e.Description)));
                }

                return this.ApiOk("User deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user with ID {UserId}", id);
                return this.ApiServerError(ex);
            }
        }

        [HttpPost("users/{id}/restore")]
        public async Task<IActionResult> RestoreUser(string id)
        {
            try
            {
                var user = await _userManager.Users
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(u => u.Id == id && u.IsDeleted);

                if (user == null)
                {
                    return this.ApiNotFound("Deleted user not found");
                }

                // Restore user
                user.IsDeleted = false;
                user.UpdatedAt = DateTime.UtcNow;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    return this.ApiBadRequest(string.Join(", ", result.Errors.Select(e => e.Description)));
                }

                return this.ApiOk("User restored successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error restoring user with ID {UserId}", id);
                return this.ApiServerError(ex);
            }
        }

        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            try
            {
                var roles = await _roleManager.Roles.ToListAsync();
                var roleDtos = _mapper.Map<List<RoleDto>>(roles);
                return this.ApiOk(roleDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving roles");
                return this.ApiServerError(ex);
            }
        }

        [HttpPut("roles/{id}")]
        public async Task<IActionResult> UpdateRole(string id, [FromBody] UpdateRoleRequest request)
        {
            try
            {
                var role = await _roleManager.FindByIdAsync(id);
                if (role == null)
                {
                    return this.ApiNotFound("Role not found");
                }

                // Check if this is a system role that should not be modified
                if (Roles.All.Contains(role.Name) && role.Name != request.Name)
                {
                    return this.ApiBadRequest("System roles cannot be renamed");
                }

                // Update role properties
                role.Name = request.Name;
                role.Description = request.Description;
                role.UpdatedAt = DateTime.UtcNow;

                var result = await _roleManager.UpdateAsync(role);
                if (!result.Succeeded)
                {
                    return this.ApiBadRequest(string.Join(", ", result.Errors.Select(e => e.Description)));
                }

                var roleDto = _mapper.Map<RoleDto>(role);
                return this.ApiOk(roleDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating role with ID {RoleId}", id);
                return this.ApiServerError(ex);
            }
        }

        [HttpPost("roles")]
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest request)
        {
            try
            {
                // Check if role already exists
                var existingRole = await _roleManager.FindByNameAsync(request.Name);
                if (existingRole != null)
                {
                    return this.ApiBadRequest($"Role {request.Name} already exists");
                }

                // Create new role
                var role = new ApplicationRole
                {
                    Name = request.Name,
                    Description = request.Description,
                    CreatedAt = DateTime.UtcNow
                };

                var result = await _roleManager.CreateAsync(role);
                if (!result.Succeeded)
                {
                    return this.ApiBadRequest(string.Join(", ", result.Errors.Select(e => e.Description)));
                }

                var roleDto = _mapper.Map<RoleDto>(role);
                return this.ApiCreated(roleDto, "Role created successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating role {RoleName}", request.Name);
                return this.ApiServerError(ex);
            }
        }

        [HttpDelete("roles/{id}")]
        public async Task<IActionResult> DeleteRole(string id)
        {
            try
            {
                var role = await _roleManager.FindByIdAsync(id);
                if (role == null)
                {
                    return this.ApiNotFound("Role not found");
                }

                // Check if this is a system role that should not be deleted
                if (Roles.All.Contains(role.Name))
                {
                    return this.ApiBadRequest("System roles cannot be deleted");
                }

                // Check if role is assigned to any users
                var usersInRole = await _userManager.GetUsersInRoleAsync(role.Name);
                if (usersInRole.Any())
                {
                    return this.ApiBadRequest($"Cannot delete role {role.Name} because it is assigned to {usersInRole.Count} users");
                }

                var result = await _roleManager.DeleteAsync(role);
                if (!result.Succeeded)
                {
                    return this.ApiBadRequest(string.Join(", ", result.Errors.Select(e => e.Description)));
                }

                return this.ApiOk("Role deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting role with ID {RoleId}", id);
                return this.ApiServerError(ex);
            }
        }

        [HttpPost("users/{userId}/roles")]
        public async Task<IActionResult> AddUserToRole(string userId, [FromBody] AddUserToRoleRequest request)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null || user.IsDeleted)
                {
                    return this.ApiNotFound("User not found");
                }

                // Check if role exists
                var role = await _roleManager.FindByNameAsync(request.RoleName);
                if (role == null)
                {
                    return this.ApiNotFound($"Role {request.RoleName} not found");
                }

                // Check if user is already in role
                var isInRole = await _userManager.IsInRoleAsync(user, request.RoleName);
                if (isInRole)
                {
                    return this.ApiBadRequest($"User is already in role {request.RoleName}");
                }

                var result = await _userManager.AddToRoleAsync(user, request.RoleName);
                if (!result.Succeeded)
                {
                    return this.ApiBadRequest(string.Join(", ", result.Errors.Select(e => e.Description)));
                }

                return this.ApiOk($"User added to role {request.RoleName} successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding user {UserId} to role {RoleName}", userId, request.RoleName);
                return this.ApiServerError(ex);
            }
        }

        [HttpDelete("users/{userId}/roles/{roleName}")]
        public async Task<IActionResult> RemoveUserFromRole(string userId, string roleName)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null || user.IsDeleted)
                {
                    return this.ApiNotFound("User not found");
                }

                // Check if role exists
                var role = await _roleManager.FindByNameAsync(roleName);
                if (role == null)
                {
                    return this.ApiNotFound($"Role {roleName} not found");
                }

                // Check if user is in role
                var isInRole = await _userManager.IsInRoleAsync(user, roleName);
                if (!isInRole)
                {
                    return this.ApiBadRequest($"User is not in role {roleName}");
                }

                var result = await _userManager.RemoveFromRoleAsync(user, roleName);
                if (!result.Succeeded)
                {
                    return this.ApiBadRequest(string.Join(", ", result.Errors.Select(e => e.Description)));
                }

                return this.ApiOk($"User removed from role {roleName} successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing user {UserId} from role {RoleName}", userId, roleName);
                return this.ApiServerError(ex);
            }
        }
    }
} 