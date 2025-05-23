using System.Collections.Generic;

namespace PayrollServer.Application.DTOs.Response
{
    public class AuthResponse
    {
        public bool IsSuccess { get; set; }
        public string? Message { get; set; }
        public string? Token { get; set; }
        public required string UserId { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public IList<string> Roles { get; set; } = new List<string>();
    }
} 