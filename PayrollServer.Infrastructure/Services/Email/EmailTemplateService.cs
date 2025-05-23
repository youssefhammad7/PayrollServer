using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;

namespace PayrollServer.Infrastructure.Services.Email
{
    public interface IEmailTemplateService
    {
        Task<string> GetTemplateContentAsync(string templateName);
        string ReplaceTemplateParameters(string template, object model);
    }

    public class EmailTemplateService(IConfiguration configuration) : IEmailTemplateService
    {
        private readonly Dictionary<string, string> _templateCache = new();

        public async Task<string> GetTemplateContentAsync(string templateName)
        {
            // Check if template is already cached
            if (_templateCache.TryGetValue(templateName, out string cachedTemplate))
            {
                return cachedTemplate;
            }

            // Get template path from configuration or use default
            string? templatePathFromConfig = configuration["EmailSettings:TemplatesPath"];
            var templatePath = templatePathFromConfig != null
                ? templatePathFromConfig
                : Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Templates", "Emails");

            var templateFile = Path.Combine(templatePath, $"{templateName}.html");

            // Check if file exists
            if (!File.Exists(templateFile))
            {
                // Try to get from embedded resources as fallback
                return await GetEmbeddedTemplateAsync(templateName);
            }

            // Read template content
            string templateContent = await File.ReadAllTextAsync(templateFile);
            
            // Cache template
            _templateCache[templateName] = templateContent;
            
            return templateContent;
        }

        public string ReplaceTemplateParameters(string template, object model)
        {
            if (model == null) return template;

            foreach (var prop in model.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance))
            {
                var value = prop.GetValue(model)?.ToString() ?? string.Empty;
                template = template.Replace($"{{{{{prop.Name}}}}}", value);
            }

            return template;
        }

        private async Task<string> GetEmbeddedTemplateAsync(string templateName)
        {
            var assembly = Assembly.GetExecutingAssembly();
            var resourceName = $"PayrollServer.Infrastructure.Templates.Emails.{templateName}.html";

            using var stream = assembly.GetManifestResourceStream(resourceName);
            if (stream == null)
            {
                // If template not found, return a basic template
                return GetBasicTemplate(templateName);
            }

            using var reader = new StreamReader(stream);
            string templateContent = await reader.ReadToEndAsync();
            _templateCache[templateName] = templateContent;
            return templateContent;
        }

        private static string GetBasicTemplate(string templateName)
        {
            // Provide a basic fallback template
            return templateName.ToLower() switch
            {
                "confirmation" => @"
                    <html>
                    <body>
                        <h1>Welcome to PayrollServer!</h1>
                        <p>Thank you for registering. Please confirm your email by clicking the link below:</p>
                        <p><a href=""{{ConfirmationLink}}"">Confirm Email</a></p>
                    </body>
                    </html>",

                "passwordreset" => @"
                    <html>
                    <body>
                        <h1>Reset Your Password</h1>
                        <p>You have requested to reset your password. Please click the link below to proceed:</p>
                        <p><a href=""{{ResetLink}}"">Reset Password</a></p>
                        <p>If you didn't request a password reset, please ignore this email.</p>
                    </body>
                    </html>",

                _ => @"
                    <html>
                    <body>
                        <h1>{{Subject}}</h1>
                        <p>{{Message}}</p>
                    </body>
                    </html>"
            };
        }
    }
} 