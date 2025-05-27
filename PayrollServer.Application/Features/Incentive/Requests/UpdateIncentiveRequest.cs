using System;

namespace PayrollServer.Application.Features.Incentive.Requests
{
    public class UpdateIncentiveRequest
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string Type { get; set; }
        public bool IsTaxable { get; set; }
    }
} 