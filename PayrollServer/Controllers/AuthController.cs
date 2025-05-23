using AutoMapper;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PayrollServer.Application.DTOs.Request;
using PayrollServer.Application.DTOs.Response;
using PayrollServer.Infrastructure.Exceptions;
using PayrollServer.Infrastructure.Identity.Interfaces;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using PayrollServer.Extensions;

namespace PayrollServer.Controllers
{
    public class AuthController : BaseApiController
    {
        private readonly IIdentityService _identityService;
        private readonly IMapper _mapper;
        private readonly IValidator<RegisterUserRequest> _registerValidator;
        private readonly IValidator<LoginRequest> _loginValidator;
        private readonly IValidator<ForgotPasswordRequest> _forgotPasswordValidator;
        private readonly IValidator<ResetPasswordRequest> _resetPasswordValidator;
        private readonly IValidator<ChangePasswordRequest> _changePasswordValidator;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IIdentityService identityService,
            IMapper mapper,
            IValidator<RegisterUserRequest> registerValidator,
            IValidator<LoginRequest> loginValidator,
            IValidator<ForgotPasswordRequest> forgotPasswordValidator,
            IValidator<ResetPasswordRequest> resetPasswordValidator,
            IValidator<ChangePasswordRequest> changePasswordValidator,
            ILogger<AuthController> logger)
        {
            _identityService = identityService;
            _mapper = mapper;
            _registerValidator = registerValidator;
            _loginValidator = loginValidator;
            _forgotPasswordValidator = forgotPasswordValidator;
            _resetPasswordValidator = resetPasswordValidator;
            _changePasswordValidator = changePasswordValidator;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserRequest request)
        {
            try
            {
                var validationResult = await _registerValidator.ValidateAsync(request);
                if (!validationResult.IsValid)
                {
                    return this.ApiBadRequest(validationResult.Errors.Select(e => e.ErrorMessage));
                }

                var (isSuccessful, userId, message) = await _identityService.RegisterUserAsync(
                    request.FirstName,
                    request.LastName,
                    request.Email,
                    request.Username,
                    request.Password);

                if (!isSuccessful)
                {
                    return this.ApiBadRequest(message);
                }

                return this.ApiOk(message);
            }
            catch (IdentityServiceException ex)
            {
                _logger.LogWarning(ex, "Identity service error during registration");
                return this.ApiBadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing registration request");
                return this.ApiServerError(ex);
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var validationResult = await _loginValidator.ValidateAsync(request);
                if (!validationResult.IsValid)
                {
                    return this.ApiBadRequest(validationResult.Errors.Select(e => e.ErrorMessage));
                }

                var (isSuccessful, userId, token) = await _identityService.LoginAsync(request.Email, request.Password);

                if (!isSuccessful)
                {
                    return this.ApiUnauthorized(token);
                }

                var user = await _identityService.GetUserByIdAsync(userId);
                if (user == null)
                {
                    return this.ApiNotFound("User not found");
                }

                var roles = await _identityService.GetUserRolesAsync(userId);

                var response = new AuthResponse
                {
                    IsSuccess = true,
                    Token = token,
                    UserId = userId,
                    Username = user.UserName ?? string.Empty,
                    Email = user.Email ?? string.Empty,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Roles = roles
                };

                return this.ApiOk(response);
            }
            catch (InvalidCredentialsException)
            {
                return this.ApiUnauthorized("Invalid email or password");
            }
            catch (AccountDeactivatedException)
            {
                return this.ApiForbidden("Your account has been deactivated. Please contact administrator.");
            }
            catch (IdentityServiceException ex)
            {
                _logger.LogWarning(ex, "Identity service error during login");
                return this.ApiBadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing login request");
                return this.ApiServerError(ex);
            }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            try
            {
                var validationResult = await _forgotPasswordValidator.ValidateAsync(request);
                if (!validationResult.IsValid)
                {
                    return this.ApiBadRequest(validationResult.Errors.Select(e => e.ErrorMessage));
                }

                var (isSuccessful, message) = await _identityService.ForgotPasswordAsync(request.Email);

                return this.ApiOk(message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing forgot password request");
                return this.ApiOk("If your email is registered, you will receive a password reset link.");
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                var validationResult = await _resetPasswordValidator.ValidateAsync(request);
                if (!validationResult.IsValid)
                {
                    return this.ApiBadRequest(validationResult.Errors.Select(e => e.ErrorMessage));
                }

                var (isSuccessful, message) = await _identityService.ResetPasswordAsync(
                    request.Email,
                    request.Token,
                    request.NewPassword);

                if (!isSuccessful)
                {
                    return this.ApiBadRequest(message);
                }

                return this.ApiOk(message);
            }
            catch (UserNotFoundException)
            {
                // Avoid user enumeration
                return this.ApiBadRequest("Invalid request");
            }
            catch (TokenValidationException ex)
            {
                return this.ApiBadRequest(ex.Message);
            }
            catch (IdentityServiceException ex)
            {
                _logger.LogWarning(ex, "Identity service error during password reset");
                return this.ApiBadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing reset password request");
                return this.ApiServerError(ex);
            }
        }

        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail([FromQuery] string userId, [FromQuery] string token)
        {
            try
            {
                if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
                {
                    return this.ApiBadRequest("User ID and token are required");
                }

                var (isSuccessful, message) = await _identityService.ConfirmEmailAsync(userId, token);

                if (!isSuccessful)
                {
                    return this.ApiBadRequest(message);
                }

                return this.ApiOk(message);
            }
            catch (UserNotFoundException)
            {
                return this.ApiNotFound("User not found");
            }
            catch (TokenValidationException)
            {
                return this.ApiBadRequest("Invalid or expired token");
            }
            catch (IdentityServiceException ex)
            {
                _logger.LogWarning(ex, "Identity service error during email confirmation");
                return this.ApiBadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing email confirmation request");
                return this.ApiServerError(ex);
            }
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                var validationResult = await _changePasswordValidator.ValidateAsync(request);
                if (!validationResult.IsValid)
                {
                    return this.ApiBadRequest(validationResult.Errors.Select(e => e.ErrorMessage));
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return this.ApiUnauthorized();
                }

                var success = await _identityService.ChangePasswordAsync(
                    userId,
                    request.CurrentPassword,
                    request.NewPassword);

                if (!success)
                {
                    return this.ApiBadRequest("Failed to change password. Please check your current password and try again.");
                }

                return this.ApiOk("Password changed successfully");
            }
            catch (UserNotFoundException)
            {
                return this.ApiNotFound("User not found");
            }
            catch (IdentityServiceException ex)
            {
                _logger.LogWarning(ex, "Identity service error during password change");
                return this.ApiBadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing change password request");
                return this.ApiServerError(ex);
            }
        }

        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return this.ApiUnauthorized();
                }

                var user = await _identityService.GetUserByIdAsync(userId);
                if (user == null)
                {
                    return this.ApiNotFound("User not found");
                }

                var roles = await _identityService.GetUserRolesAsync(userId);
                var response = _mapper.Map<UserProfileResponse>(user);
                response.Roles = roles;

                return this.ApiOk(response);
            }
            catch (UserNotFoundException)
            {
                return this.ApiNotFound("User not found");
            }
            catch (IdentityServiceException ex)
            {
                _logger.LogWarning(ex, "Identity service error retrieving user profile");
                return this.ApiBadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user profile");
                return this.ApiServerError(ex);
            }
        }

        [Authorize]
        [HttpGet("is-in-role")]
        public async Task<IActionResult> IsInRole([FromQuery] string role)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return this.ApiUnauthorized();
                }

                var isInRole = await _identityService.IsInRoleAsync(userId, role);
                return this.ApiOk(isInRole);
            }
            catch (UserNotFoundException)
            {
                return this.ApiNotFound("User not found");
            }
            catch (IdentityServiceException ex)
            {
                _logger.LogWarning(ex, "Identity service error checking user role");
                return this.ApiBadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking user role");
                return this.ApiServerError(ex);
            }
        }
    }
}