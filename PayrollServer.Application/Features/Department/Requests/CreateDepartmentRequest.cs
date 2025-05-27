namespace PayrollServer.Application.Features.Department.Requests
{
    public class CreateDepartmentRequest
    {
        public string Name { get; set; } = string.Empty;
        public decimal? IncentivePercentage { get; set; }
    }
} 