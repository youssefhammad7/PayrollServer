using System;

namespace PayrollServer.Application.DTOs.ServiceBracket
{
    public class ServiceBracketDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int MinYearsOfService { get; set; }
        public int? MaxYearsOfService { get; set; }
        public decimal IncentivePercentage { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
} 