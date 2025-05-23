using System.Threading.Tasks;

namespace PayrollServer.Infrastructure.Services.Email
{
    public interface IEmailService
    {
        Task SendEmailAsync(EmailMessage emailMessage);
        Task SendTemplatedEmailAsync(string to, string templateName, object model, string? subject = null);
    }
} 