namespace PayrollServer.Application.Features.ServiceBracket.Requests
{
    public class UpdateServiceBracketRequest
    {
        public string Name { get; set; }
        public int MinYearsOfService { get; set; }
        public int? MaxYearsOfService { get; set; }
        public decimal IncentivePercentage { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
    }
} 