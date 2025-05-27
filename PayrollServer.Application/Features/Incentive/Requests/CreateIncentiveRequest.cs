using System;

namespace PayrollServer.Application.Features.Incentive.Requests
{
    public class CreateIncentiveRequest
    {
        public int EmployeeId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string Type { get; set; }
        public bool IsTaxable { get; set; } = true;
    }
} 