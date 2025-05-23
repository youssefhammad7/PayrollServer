using AutoMapper;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PayrollServer.Application.DTOs.Request;
using PayrollServer.Application.DTOs.Response;
using PayrollServer.Infrastructure.Identity.Interfaces;
using System.Security.Claims;
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

        public AuthController(
            IIdentityService identityService,
            IMapper mapper,
            IValidator<RegisterUserRequest> registerValidator,
            IValidator<LoginRequest> loginValidator,
            IValidator<ForgotPasswordRequest> forgotPasswordValidator,
            IValidator<ResetPasswordRequest> resetPasswordValidator,
            IValidator<ChangePasswordRequest> changePasswordValidator)
        {
            _identityService = identityService;
            _mapper = mapper;
            _registerValidator = registerValidator;
            _loginValidator = loginValidator;
            _forgotPasswordValidator = forgotPasswordValidator;
            _resetPasswordValidator = resetPasswordValidator;
            _changePasswordValidator = changePasswordValidator;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserRequest request)
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

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
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
            var roles = await _identityService.GetUserRolesAsync(userId);

            var response = new AuthResponse
            {
                IsSuccess = true,
                Token = token,
                UserId = userId,
                Username = user.UserName,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Roles = roles
            };

            return this.ApiOk(response);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var validationResult = await _forgotPasswordValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                return this.ApiBadRequest(validationResult.Errors.Select(e => e.ErrorMessage));
            }

            var (isSuccessful, message) = await _identityService.ForgotPasswordAsync(request.Email);

            return this.ApiOk(message);
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
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

        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail([FromQuery] string userId, [FromQuery] string token)
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

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
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

        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
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

        [Authorize]
        [HttpGet("is-in-role")]
        public async Task<IActionResult> IsInRole([FromQuery] string role)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return this.ApiUnauthorized();
            }

            var isInRole = await _identityService.IsInRoleAsync(userId, role);
            return this.ApiOk(isInRole);
        }
    }
}