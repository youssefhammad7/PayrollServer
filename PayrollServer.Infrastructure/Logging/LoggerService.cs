using Microsoft.Extensions.Configuration;
using Serilog;
using Serilog.Events;
using Serilog.Sinks.MSSqlServer;
using System;
using System.Collections.ObjectModel;
using System.Data;
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

            // Get connection string from configuration
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            // SQL Server sink configuration
            var sinkOptions = new MSSqlServerSinkOptions
            {
                TableName = "Logs",
                AutoCreateSqlTable = true,
                BatchPostingLimit = 50,
                BatchPeriod = TimeSpan.FromSeconds(5)
            };

            // Define the SQL Server columns
            var columnOptions = new ColumnOptions
            {
                AdditionalColumns = new Collection<SqlColumn>
                {
                    new SqlColumn { ColumnName = "UserName", DataType = SqlDbType.NVarChar, DataLength = 256 },
                    new SqlColumn { ColumnName = "SourceContext", DataType = SqlDbType.NVarChar, DataLength = 256 },
                    new SqlColumn { ColumnName = "RequestPath", DataType = SqlDbType.NVarChar, DataLength = 256 },
                    new SqlColumn { ColumnName = "ActionName", DataType = SqlDbType.NVarChar, DataLength = 256 }
                }
            };

            // Set which standard columns to include
            columnOptions.Store.Add(StandardColumn.LogEvent);
            columnOptions.TimeStamp.ConvertToUtc = true;

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
                .WriteTo.MSSqlServer(
                    connectionString: connectionString,
                    sinkOptions: sinkOptions,
                    columnOptions: columnOptions)
                .CreateLogger();
        }
    }
} 