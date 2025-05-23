using System;

namespace PayrollServer.Infrastructure.Exceptions
{
    public class IdentityServiceException : InfrastructureException
    {
        public IdentityServiceException(string message) : base(message)
        {
        }

        public IdentityServiceException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }

    public class InvalidCredentialsException : IdentityServiceException
    {
        public InvalidCredentialsException() : base("Invalid credentials provided.")
        {
        }
    }

    public class UserNotFoundException : IdentityServiceException
    {
        public UserNotFoundException(string userId) : base($"User with ID '{userId}' was not found.")
        {
        }

        public UserNotFoundException(string email, bool isEmail) : base($"User with email '{email}' was not found.")
        {
        }
    }

    public class AccountLockedException : IdentityServiceException
    {
        public AccountLockedException() : base("This account has been locked due to too many failed login attempts.")
        {
        }
    }

    public class AccountDeactivatedException : IdentityServiceException
    {
        public AccountDeactivatedException() : base("This account has been deactivated.")
        {
        }
    }

    public class EmailAlreadyConfirmedException : IdentityServiceException
    {
        public EmailAlreadyConfirmedException() : base("Email address is already confirmed.")
        {
        }
    }

    public class TokenValidationException : IdentityServiceException
    {
        public TokenValidationException() : base("The provided token is invalid or has expired.")
        {
        }

        public TokenValidationException(string message) : base(message)
        {
        }
    }
} 