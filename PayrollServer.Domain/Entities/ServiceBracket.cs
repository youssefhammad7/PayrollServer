using System;

namespace PayrollServer.Domain.Entities
{
    public class ServiceBracket : BaseEntity
    {
        public string Name { get; set; }
        public int MinYearsOfService { get; set; }
        public int? MaxYearsOfService { get; set; }
        public decimal IncentivePercentage { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; } = true;
    }
} 