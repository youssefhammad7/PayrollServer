using Microsoft.Extensions.Configuration;
using Serilog;
using Serilog.Events;
using System;
using System.IO;

namespace PayrollServer.Infrastructure.Logging
{
    public static class LoggerService
    {
        public static ILogger CreateLogger(IConfiguration configuration)
        {
            var logPath = configuration["Logging:FilePath"] ?? "Logs/app-.log";
            var logFolder = Path.GetDirectoryName(logPath);
            
            if (!string.IsNullOrEmpty(logFolder) && !Directory.Exists(logFolder))
            {
                Directory.CreateDirectory(logFolder);
            }

            return new LoggerConfiguration()
                .MinimumLevel.Information()
                .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
                .MinimumLevel.Override("System", LogEventLevel.Warning)
                .Enrich.FromLogContext()
                .Enrich.WithMachineName()
                .Enrich.WithEnvironmentName()
                .Enrich.WithProcessId()
                .Enrich.WithThreadId()
                .WriteTo.Console()
                .WriteTo.File(
                    logPath,
                    rollingInterval: RollingInterval.Day,
                    rollOnFileSizeLimit: true,
                    fileSizeLimitBytes: 10 * 1024 * 1024, // 10MB
                    retainedFileCountLimit: 31,
                    outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
                .CreateLogger();
        }
    }
} 