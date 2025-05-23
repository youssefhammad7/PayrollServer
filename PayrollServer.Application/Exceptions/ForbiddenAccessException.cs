using System;

namespace PayrollServer.Application.Exceptions
{
    public class ForbiddenAccessException : ApplicationException
    {
        public ForbiddenAccessException() : base("Access denied. You do not have permission to access this resource.")
        {
        }

        public ForbiddenAccessException(string message) : base(message)
        {
        }

        public ForbiddenAccessException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
} 