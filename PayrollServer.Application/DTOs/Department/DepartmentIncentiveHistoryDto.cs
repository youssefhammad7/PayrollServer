using System;

namespace PayrollServer.Application.DTOs.Department
{
    public class DepartmentIncentiveHistoryDto
    {
        public int Id { get; set; }
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public decimal IncentivePercentage { get; set; }
        public DateTime EffectiveDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }
} 