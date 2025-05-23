using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using PayrollServer.Domain.Entities;
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

        public IdentityService(
            UserManager<ApplicationUser> userManager,
            RoleManager<ApplicationRole> roleManager,
            IUserClaimsPrincipalFactory<ApplicationUser> userClaimsPrincipalFactory,
            IAuthorizationService authorizationService,
            IConfiguration configuration,
            IEmailService emailService)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _userClaimsPrincipalFactory = userClaimsPrincipalFactory;
            _authorizationService = authorizationService;
            _configuration = configuration;
            _emailService = emailService;
        }

        public async Task<(bool isSuccessful, string userId, string message)> RegisterUserAsync(string firstName, string lastName, string email, string username, string password)
        {
            var user = new ApplicationUser
            {
                Email = email,
                UserName = username,
                FirstName = firstName,
                LastName = lastName,
                EmailConfirmed = false,  // Set to false to require email confirmation
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, password);

            if (result.Succeeded)
            {
                // Generate email confirmation token and send email
                var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                await SendEmailConfirmationAsync(user, token);

                // Add user to default 'User' role if it exists
                if (await _roleManager.RoleExistsAsync("User"))
                {
                    await _userManager.AddToRoleAsync(user, "User");
                }

                return (true, user.Id, "User registered successfully. Please check your email to confirm your account.");
            }

            return (false, string.Empty, string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        public async Task<(bool isSuccessful, string userId, string token)> LoginAsync(string email, string password)
        {
            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
            {
                return (false, string.Empty, "Invalid email or password");
            }

            if (!user.EmailConfirmed)
            {
                return (false, string.Empty, "Please confirm your email address before logging in.");
            }

            if (!user.IsActive)
            {
                return (false, string.Empty, "Your account has been deactivated. Please contact administrator.");
            }

            var result = await _userManager.CheckPasswordAsync(user, password);

            if (!result)
            {
                return (false, string.Empty, "Invalid email or password");
            }

            var token = await GenerateJwtToken(user);
            return (true, user.Id, token);
        }

        public async Task<bool> IsInRoleAsync(string userId, string role)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return false;
            }

            return await _userManager.IsInRoleAsync(user, role);
        }

        public async Task<bool> AuthorizeAsync(string userId, string policyName)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return false;
            }

            var principal = await _userClaimsPrincipalFactory.CreateAsync(user);
            var result = await _authorizationService.AuthorizeAsync(principal, policyName);

            return result.Succeeded;
        }

        public async Task<ApplicationUser> GetUserByIdAsync(string userId)
        {
            return await _userManager.FindByIdAsync(userId);
        }

        public async Task<ApplicationUser> GetUserByEmailAsync(string email)
        {
            return await _userManager.FindByEmailAsync(email);
        }

        public async Task<IList<string>> GetUserRolesAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return new List<string>();
            }

            return await _userManager.GetRolesAsync(user);
        }

        //public async Task<bool> AddToRoleAsync(string userId, string role)
        //{
        //    var user = await _userManager.FindByIdAsync(userId);
        //    if (user == null)
        //    {
        //        return false;
        //    }

        //    if (!await _roleManager.RoleExistsAsync(role))
        //    {
        //        await _roleManager.CreateAsync(new ApplicationRole(role));
        //    }

        //    var result = await _userManager.AddToRoleAsync(user, role);
        //    return result.Succeeded;
        //}

        public async Task<bool> RemoveFromRoleAsync(string userId, string role)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return false;
            }

            var result = await _userManager.RemoveFromRoleAsync(user, role);
            return result.Succeeded;
        }

        public async Task<bool> ChangePasswordAsync(string userId, string currentPassword, string newPassword)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return false;
            }

            var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
            return result.Succeeded;
        }

        public async Task<(bool isSuccessful, string message)> ForgotPasswordAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                // Return success to prevent user enumeration
                return (true, "If your email is registered, you will receive a password reset link.");
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            await SendPasswordResetEmailAsync(user, token);

            return (true, "Password reset link has been sent to your email.");
        }

        public async Task<(bool isSuccessful, string message)> ResetPasswordAsync(string email, string token, string newPassword)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                return (false, "Invalid request.");
            }

            var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
            if (result.Succeeded)
            {
                return (true, "Your password has been reset successfully.");
            }

            return (false, string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        public async Task<(bool isSuccessful, string message)> ConfirmEmailAsync(string userId, string token)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return (false, "Invalid user.");
            }

            var result = await _userManager.ConfirmEmailAsync(user, token);
            if (result.Succeeded)
            {
                return (true, "Thank you for confirming your email.");
            }

            return (false, "Email confirmation failed. Please try again or request a new confirmation link.");
        }

        public async Task<(bool isSuccessful, string message)> GenerateEmailConfirmationTokenAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                return (false, "User not found.");
            }

            if (user.EmailConfirmed)
            {
                return (false, "Email already confirmed.");
            }

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            await SendEmailConfirmationAsync(user, token);

            return (true, "Email confirmation link has been sent to your email.");
        }

        private async Task<string> GenerateJwtToken(ApplicationUser user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim("FirstName", user.FirstName),
                new Claim("LastName", user.LastName)
            };

            var roles = await _userManager.GetRolesAsync(user);
            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:Key"]));
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

        private async Task SendEmailConfirmationAsync(ApplicationUser user, string token)
        {
            var callbackUrl = $"{_configuration["AppUrl"]}/account/confirm-email?userId={user.Id}&token={Uri.EscapeDataString(token)}";

            var emailMessage = new EmailMessage
            {
                To = user.Email,
                Subject = "Confirm your email",
                Body = $"<h1>Welcome to Payroll Server!</h1><p>Please confirm your account by <a href='{callbackUrl}'>clicking here</a>.</p>",
                IsHtml = true
            };

            await _emailService.SendEmailAsync(emailMessage);
        }

        private async Task SendPasswordResetEmailAsync(ApplicationUser user, string token)
        {
            var callbackUrl = $"{_configuration["AppUrl"]}/account/reset-password?email={user.Email}&token={Uri.EscapeDataString(token)}";

            var emailMessage = new EmailMessage
            {
                To = user.Email,
                Subject = "Reset your password",
                Body = $"<h1>Reset Your Password</h1><p>Please reset your password by <a href='{callbackUrl}'>clicking here</a>.</p>",
                IsHtml = true
            };

            await _emailService.SendEmailAsync(emailMessage);
        }
    }
} 