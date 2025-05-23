using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace PayrollServer.Infrastructure.Services.Email
{
    public class SmtpEmailService(
        IConfiguration configuration,
        IEmailTemplateService templateService,
        ILogger<SmtpEmailService> logger) : IEmailService
    {
        public async Task SendEmailAsync(EmailMessage emailMessage)
        {
            try
            {
                var mailMessage = CreateMailMessage(emailMessage);
                using (var smtpClient = CreateSmtpClient())
                {
                    await smtpClient.SendMailAsync(mailMessage);
                }
                logger.LogInformation("Email sent successfully to {RecipientEmail}", emailMessage.To);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send email to {RecipientEmail}", emailMessage.To);
                throw;
            }
        }

        public async Task SendTemplatedEmailAsync(string to, string templateName, object model, string? subject = null)
        {
            try
            {
                // Get template content
                var templateContent = await templateService.GetTemplateContentAsync(templateName);
                
                // Replace parameters in template
                var emailBody = templateService.ReplaceTemplateParameters(templateContent, model);

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
                logger.LogError(ex, "Failed to send templated email to {RecipientEmail}", to);
                throw;
            }
        }

        private MailMessage CreateMailMessage(EmailMessage emailMessage)
        {
            var from = emailMessage.From ?? configuration["EmailSettings:DefaultFromEmail"] 
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
            var host = configuration["EmailSettings:SmtpHost"] ?? "localhost";
            var port = int.Parse(configuration["EmailSettings:SmtpPort"] ?? "25");
            var username = configuration["EmailSettings:SmtpUsername"];
            var password = configuration["EmailSettings:SmtpPassword"];
            var enableSsl = bool.Parse(configuration["EmailSettings:EnableSsl"] ?? "true");

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

        private static string GetDefaultSubject(string templateName)
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