namespace PayrollServer.Application.DTOs.Request
{
    public class ChangePasswordRequest
    {
        public required string CurrentPassword { get; set; } 
        public required string NewPassword { get; set; }
        public required string ConfirmPassword { get; set; }
    }
} 