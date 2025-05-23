using System;

namespace PayrollServer.Infrastructure.Exceptions
{
    public class DatabaseConnectionException : InfrastructureException
    {
        public DatabaseConnectionException(string message) : base(message)
        {
        }

        public DatabaseConnectionException(string message, Exception innerException) : base(message, innerException)
        {
        }

        // Change signature by adding a parameter or using a different approach
        public DatabaseConnectionException(string connectionString, Exception innerException, bool isConnectionString = true)
            : base($"Failed to connect to database using connection string: {MaskConnectionString(connectionString)}", innerException)
        {
        }

        private static string MaskConnectionString(string connectionString)
        {
            // Simple masking to hide sensitive information in the connection string
            if (string.IsNullOrEmpty(connectionString))
                return string.Empty;

            try
            {
                var parts = connectionString.Split(';');
                for (int i = 0; i < parts.Length; i++)
                {
                    var part = parts[i];
                    if (part.Contains("password", StringComparison.OrdinalIgnoreCase) ||
                        part.Contains("pwd", StringComparison.OrdinalIgnoreCase) ||
                        part.Contains("user id", StringComparison.OrdinalIgnoreCase) ||
                        part.Contains("uid", StringComparison.OrdinalIgnoreCase))
                    {
                        var keyValue = part.Split('=');
                        if (keyValue.Length > 1)
                        {
                            parts[i] = $"{keyValue[0]}=******";
                        }
                    }
                }
                return string.Join(";", parts);
            }
            catch
            {
                // If anything goes wrong with masking, return a completely masked string
                return "******";
            }
        }
    }
}