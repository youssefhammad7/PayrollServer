using System;
using System.Collections.Generic;

namespace PayrollServer.Application.DTOs.Response
{
    public class UserProfileResponse
    {
        public string UserId { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public DateTime CreatedAt { get; set; }
        public IList<string> Roles { get; set; } = new List<string>();
    }
} 