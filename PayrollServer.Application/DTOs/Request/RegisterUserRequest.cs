using System;

namespace PayrollServer.Application.DTOs.Request
{
    public class RegisterUserRequest
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public required string Username { get; set; }
        public required string Password { get; set; }
        public required string ConfirmPassword { get; set; }
        public DateTime DateOfBirth { get; set; }
    }
} 