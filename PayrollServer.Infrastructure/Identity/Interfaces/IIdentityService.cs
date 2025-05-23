using PayrollServer.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Infrastructure.Identity.Interfaces
{
    public interface IIdentityService
    {
        Task<(bool isSuccessful, string userId, string message)> RegisterUserAsync(string firstName, string lastName, string email, string username, string password);
        Task<(bool isSuccessful, string userId, string token)> LoginAsync(string email, string password);
        Task<bool> IsInRoleAsync(string userId, string role);
        Task<bool> AuthorizeAsync(string userId, string policyName);
        Task<ApplicationUser?> GetUserByIdAsync(string userId);
        Task<ApplicationUser?> GetUserByEmailAsync(string email);
        Task<IList<string>> GetUserRolesAsync(string userId);
        //Task<bool> AddToRoleAsync(string userId, string role);
        Task<bool> RemoveFromRoleAsync(string userId, string role);
        Task<bool> ChangePasswordAsync(string userId, string currentPassword, string newPassword);
        Task<(bool isSuccessful, string message)> ForgotPasswordAsync(string email);
        Task<(bool isSuccessful, string message)> ResetPasswordAsync(string email, string token, string newPassword);
        Task<(bool isSuccessful, string message)> ConfirmEmailAsync(string userId, string token);
        Task<(bool isSuccessful, string message)> GenerateEmailConfirmationTokenAsync(string email);
    }
} 