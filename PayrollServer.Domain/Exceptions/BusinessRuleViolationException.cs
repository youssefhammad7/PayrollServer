using System;

namespace PayrollServer.Domain.Exceptions
{
    public class BusinessRuleViolationException : DomainException
    {
        public BusinessRuleViolationException(string message) : base(message)
        {
            RuleName = string.Empty;
        }

        public BusinessRuleViolationException(string message, Exception innerException) : base(message, innerException)
        {
            RuleName = string.Empty;
        }

        public BusinessRuleViolationException(string ruleName, string message)
            : base($"Business rule '{ruleName}' was violated: {message}")
        {
            RuleName = ruleName;
        }

        public string RuleName { get; }
    }
} 