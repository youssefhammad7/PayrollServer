using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace PayrollServer.Infrastructure.Services.Email
{
    public class SmtpEmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly IEmailTemplateService _templateService;
        private readonly ILogger<SmtpEmailService> _logger;

        public SmtpEmailService(
            IConfiguration configuration,
            IEmailTemplateService templateService,
            ILogger<SmtpEmailService> logger)
        {
            _configuration = configuration;
            _templateService = templateService;
            _logger = logger;
        }

        public async Task SendEmailAsync(EmailMessage emailMessage)
        {
            try
            {
                var mailMessage = CreateMailMessage(emailMessage);
                using (var smtpClient = CreateSmtpClient())
                {
                    await smtpClient.SendMailAsync(mailMessage);
                }
                _logger.LogInformation("Email sent successfully to {RecipientEmail}", emailMessage.To);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {RecipientEmail}", emailMessage.To);
                throw;
            }
        }

        public async Task SendTemplatedEmailAsync(string to, string templateName, object model, string subject = null)
        {
            try
            {
                // Get template content
                var templateContent = await _templateService.GetTemplateContentAsync(templateName);
                
                // Replace parameters in template
                var emailBody = _templateService.ReplaceTemplateParameters(templateContent, model);

                // Create and send email
                var emailMessage = new EmailMessage
                {
                    To = to,
                    Subject = subject ?? GetDefaultSubject(templateName),
                    Body = emailBody,
                    IsHtml = true
                };

                await SendEmailAsync(emailMessage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send templated email to {RecipientEmail}", to);
                throw;
            }
        }

        private MailMessage CreateMailMessage(EmailMessage emailMessage)
        {
            var from = emailMessage.From ?? _configuration["EmailSettings:DefaultFromEmail"] 
                ?? "no-reply@payrollserver.com";
            
            var mail = new MailMessage
            {
                From = new MailAddress(from),
                Subject = emailMessage.Subject,
                Body = emailMessage.Body,
                IsBodyHtml = emailMessage.IsHtml
            };

            mail.To.Add(emailMessage.To);

            // Add attachments if any
            foreach (var attachment in emailMessage.Attachments)
            {
                var mailAttachment = new Attachment(
                    new System.IO.MemoryStream(attachment.Content),
                    attachment.FileName,
                    attachment.ContentType);
                
                mail.Attachments.Add(mailAttachment);
            }

            return mail;
        }

        private SmtpClient CreateSmtpClient()
        {
            var host = _configuration["EmailSettings:SmtpHost"] ?? "localhost";
            var port = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "25");
            var username = _configuration["EmailSettings:SmtpUsername"];
            var password = _configuration["EmailSettings:SmtpPassword"];
            var enableSsl = bool.Parse(_configuration["EmailSettings:EnableSsl"] ?? "true");

            var smtpClient = new SmtpClient(host, port)
            {
                EnableSsl = enableSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network
            };

            // Set credentials if provided
            if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
            {
                smtpClient.Credentials = new NetworkCredential(username, password);
            }

            return smtpClient;
        }

        private string GetDefaultSubject(string templateName)
        {
            return templateName.ToLower() switch
            {
                "confirmation" => "Confirm Your Email",
                "passwordreset" => "Reset Your Password",
                _ => "Notification from PayrollServer"
            };
        }
    }
} 