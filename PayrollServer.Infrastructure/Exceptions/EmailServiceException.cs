using System;

namespace PayrollServer.Infrastructure.Exceptions
{
    public class EmailServiceException : InfrastructureException
    {
        public EmailServiceException(string message) : base(message)
        {
            Recipient = string.Empty;
        }

        public EmailServiceException(string message, Exception innerException) : base(message, innerException)
        {
            Recipient = string.Empty;
        }

        // Modified signature with an additional parameter
        public EmailServiceException(string recipient, Exception innerException, bool isRecipient = true)
            : base($"Failed to send email to: {recipient}", innerException)
        {
            Recipient = recipient;
        }

        public string Recipient { get; }
    }
} 