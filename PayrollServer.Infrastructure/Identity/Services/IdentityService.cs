using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using PayrollServer.Domain.Entities;
using PayrollServer.Infrastructure.Exceptions;
using PayrollServer.Infrastructure.Identity.Interfaces;
using PayrollServer.Infrastructure.Services.Email;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace PayrollServer.Infrastructure.Identity.Services
{
    public class IdentityService : IIdentityService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly IUserClaimsPrincipalFactory<ApplicationUser> _userClaimsPrincipalFactory;
        private readonly IAuthorizationService _authorizationService;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;
        private readonly ILogger<IdentityService> _logger;

        public IdentityService(
            UserManager<ApplicationUser> userManager,
            RoleManager<ApplicationRole> roleManager,
            IUserClaimsPrincipalFactory<ApplicationUser> userClaimsPrincipalFactory,
            IAuthorizationService authorizationService,
            IConfiguration configuration,
            IEmailService emailService,
            ILogger<IdentityService> logger)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _userClaimsPrincipalFactory = userClaimsPrincipalFactory;
            _authorizationService = authorizationService;
            _configuration = configuration;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<(bool isSuccessful, string userId, string message)> RegisterUserAsync(string firstName, string lastName, string email, string username, string password)
        {
            try
            {
                var user = new ApplicationUser
                {
                    Email = email,
                    UserName = username,
                    FirstName = firstName,
                    LastName = lastName,
                    EmailConfirmed = true, // Auto-confirm for development
                    CreatedAt = DateTime.UtcNow
                };

                var result = await _userManager.CreateAsync(user, password);

                if (result.Succeeded)
                {
                    // Add user to default 'User' role if it exists
                    if (await _roleManager.RoleExistsAsync("User"))
                    {
                        await _userManager.AddToRoleAsync(user, "User");
                    }

                    // Email confirmation commented out for development
                    // var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                    // await SendEmailConfirmationAsync(user, token);

                    return (true, user.Id, "User registered successfully.");
                }

                return (false, string.Empty, string.Join(", ", result.Errors.Select(e => e.Description)));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user registration for email {Email}", email);
                throw new IdentityServiceException("An error occurred while registering the user.", ex);
            }
        }

        public async Task<(bool isSuccessful, string userId, string token)> LoginAsync(string email, string password)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);

                if (user == null)
                {
                    _logger.LogWarning("Login attempt failed: User with email {Email} not found", email);
                    throw new InvalidCredentialsException();
                }

                // Email confirmation check commented out for development
                // if (!user.EmailConfirmed)
                // {
                //     throw new EmailNotConfirmedException();
                // }

                if (!user.IsActive)
                {
                    _logger.LogWarning("Login attempt for deactivated account with email {Email}", email);
                    throw new AccountDeactivatedException();
                }

                var result = await _userManager.CheckPasswordAsync(user, password);

                if (!result)
                {
                    _logger.LogWarning("Invalid password for user with email {Email}", email);
                    throw new InvalidCredentialsException();
                }

                var token = await GenerateJwtToken(user);
                return (true, user.Id, token);
            }
            catch (IdentityServiceException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during login for email {Email}", email);
                throw new IdentityServiceException("An error occurred during the login process.", ex);
            }
        }

        public async Task<bool> IsInRoleAsync(string userId, string role)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);

                if (user == null)
                {
                    throw new UserNotFoundException(userId);
                }

                return await _userManager.IsInRoleAsync(user, role);
            }
            catch (IdentityServiceException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if user {UserId} is in role {Role}", userId, role);
                throw new IdentityServiceException($"An error occurred while checking if user is in role '{role}'.", ex);
            }
        }

        public async Task<bool> AuthorizeAsync(string userId, string policyName)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);

                if (user == null)
                {
                    throw new UserNotFoundException(userId);
                }

                var principal = await _userClaimsPrincipalFactory.CreateAsync(user);
                var result = await _authorizationService.AuthorizeAsync(principal, policyName);

                return result.Succeeded;
            }
            catch (IdentityServiceException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error authorizing user {UserId} against policy {Policy}", userId, policyName);
                throw new IdentityServiceException($"An error occurred while authorizing against policy '{policyName}'.", ex);
            }
        }

        public async Task<ApplicationUser?> GetUserByIdAsync(string userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    _logger.LogWarning("User with ID {UserId} not found", userId);
                }
                return user;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user with ID {UserId}", userId);
                throw new IdentityServiceException($"An error occurred while retrieving user by ID.", ex);
            }
        }

        public async Task<ApplicationUser?> GetUserByEmailAsync(string email)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    _logger.LogWarning("User with email {Email} not found", email);
                }
                return user;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user with email {Email}", email);
                throw new IdentityServiceException($"An error occurred while retrieving user by email.", ex);
            }
        }

        public async Task<IList<string>> GetUserRolesAsync(string userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    throw new UserNotFoundException(userId);
                }

                return await _userManager.GetRolesAsync(user);
            }
            catch (IdentityServiceException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving roles for user {UserId}", userId);
                throw new IdentityServiceException("An error occurred while retrieving user roles.", ex);
            }
        }

        public async Task<bool> RemoveFromRoleAsync(string userId, string role)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    throw new UserNotFoundException(userId);
                }

                var result = await _userManager.RemoveFromRoleAsync(user, role);
                return result.Succeeded;
            }
            catch (IdentityServiceException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing user {UserId} from role {Role}", userId, role);
                throw new IdentityServiceException($"An error occurred while removing user from role '{role}'.", ex);
            }
        }

        public async Task<bool> ChangePasswordAsync(string userId, string currentPassword, string newPassword)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    throw new UserNotFoundException(userId);
                }

                var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
                return result.Succeeded;
            }
            catch (IdentityServiceException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password for user {UserId}", userId);
                throw new IdentityServiceException("An error occurred while changing the password.", ex);
            }
        }

        public async Task<(bool isSuccessful, string message)> ForgotPasswordAsync(string email)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    // Return success to prevent user enumeration
                    return (true, "If your email is registered, you will receive a password reset link.");
                }

                // Email functionality commented out for development
                // var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                // await SendPasswordResetEmailAsync(user, token);

                return (true, "If your email is registered, you will receive a password reset link.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during password reset request for email {Email}", email);
                // Still return success to prevent user enumeration
                return (true, "If your email is registered, you will receive a password reset link.");
            }
        }

        public async Task<(bool isSuccessful, string message)> ResetPasswordAsync(string email, string token, string newPassword)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    throw new UserNotFoundException(email, true);
                }

                var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
                if (result.Succeeded)
                {
                    return (true, "Your password has been reset successfully.");
                }

                throw new TokenValidationException(string.Join(", ", result.Errors.Select(e => e.Description)));
            }
            catch (IdentityServiceException ex)
            {
                _logger.LogWarning(ex, "Password reset failed for email {Email}", email);
                return (false, ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during password reset for email {Email}", email);
                return (false, "An error occurred while resetting your password.");
            }
        }

        public async Task<(bool isSuccessful, string message)> ConfirmEmailAsync(string userId, string token)
        {
            // Method commented out for development since we're auto-confirming emails
            return (true, "Email confirmed successfully.");
            
            /*
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    throw new UserNotFoundException(userId);
                }

                var result = await _userManager.ConfirmEmailAsync(user, token);
                if (result.Succeeded)
                {
                    return (true, "Thank you for confirming your email.");
                }

                throw new TokenValidationException();
            }
            catch (IdentityServiceException ex)
            {
                _logger.LogWarning(ex, "Email confirmation failed for user {UserId}", userId);
                return (false, ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during email confirmation for user {UserId}", userId);
                return (false, "Email confirmation failed. Please try again or request a new confirmation link.");
            }
            */
        }

        public async Task<(bool isSuccessful, string message)> GenerateEmailConfirmationTokenAsync(string email)
        {
            // Method commented out for development since we're auto-confirming emails
            return (true, "Email confirmed successfully.");
            
            /*
            try
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    throw new UserNotFoundException(email, true);
                }

                if (user.EmailConfirmed)
                {
                    throw new EmailAlreadyConfirmedException();
                }

                var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                await SendEmailConfirmationAsync(user, token);

                return (true, "Email confirmation link has been sent to your email.");
            }
            catch (IdentityServiceException ex)
            {
                _logger.LogWarning(ex, "Error generating email confirmation token for {Email}", email);
                return (false, ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error generating email confirmation token for {Email}", email);
                return (false, "An error occurred while processing your request.");
            }
            */
        }

        private async Task<string> GenerateJwtToken(ApplicationUser user)
        {
            try
            {
                var claims = new List<Claim>
                {
                    new(JwtRegisteredClaimNames.Sub, user.Id ?? string.Empty),
                    new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
                    new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new(ClaimTypes.NameIdentifier, user.Id ?? string.Empty),
                    new(ClaimTypes.Name, user.UserName ?? string.Empty),
                    new("FirstName", user.FirstName),
                    new("LastName", user.LastName)
                };

                var roles = await _userManager.GetRolesAsync(user);
                claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

                var jwtKey = _configuration["JwtSettings:Key"] 
                    ?? throw new InvalidOperationException("JWT Key not found in configuration.");
                    
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
                var expires = DateTime.Now.AddDays(Convert.ToDouble(_configuration["JwtSettings:ExpirationInDays"]));

                var token = new JwtSecurityToken(
                    issuer: _configuration["JwtSettings:Issuer"],
                    audience: _configuration["JwtSettings:Audience"],
                    claims: claims,
                    expires: expires,
                    signingCredentials: creds
                );

                return new JwtSecurityTokenHandler().WriteToken(token);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating JWT token for user {UserId}", user.Id);
                throw new IdentityServiceException("An error occurred while generating the authentication token.", ex);
            }
        }

        private async Task SendEmailConfirmationAsync(ApplicationUser user, string token)
        {
            // Method commented out for development
            /*
            try
            {
                var callbackUrl = $"{_configuration["AppUrl"]}/account/confirm-email?userId={user.Id}&token={Uri.EscapeDataString(token)}";

                var emailMessage = new EmailMessage
                {
                    To = user.Email ?? string.Empty,
                    Subject = "Confirm your email",
                    Body = $"<h1>Welcome to Payroll Server!</h1><p>Please confirm your account by <a href='{callbackUrl}'>clicking here</a>.</p>",
                    IsHtml = true
                };

                await _emailService.SendEmailAsync(emailMessage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending confirmation email to {Email}", user.Email);
                // We don't throw here to prevent registration failure due to email issues
            }
            */
        }

        private async Task SendPasswordResetEmailAsync(ApplicationUser user, string token)
        {
            // Method commented out for development
            /*
            try
            {
                var callbackUrl = $"{_configuration["AppUrl"]}/account/reset-password?email={user.Email}&token={Uri.EscapeDataString(token)}";

                var emailMessage = new EmailMessage
                {
                    To = user.Email ?? string.Empty,
                    Subject = "Reset your password",
                    Body = $"<h1>Reset Your Password</h1><p>Please reset your password by <a href='{callbackUrl}'>clicking here</a>.</p>",
                    IsHtml = true
                };

                await _emailService.SendEmailAsync(emailMessage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending password reset email to {Email}", user.Email);
                // We don't throw here to prevent password reset failure due to email issues
            }
            */
        }
    }
} 