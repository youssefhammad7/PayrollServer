namespace PayrollServer.Application.DTOs.Request
{
    public class UpdateRoleRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
} 