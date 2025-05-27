using System;

namespace PayrollServer.Domain.Entities
{
    public class DepartmentIncentiveHistory : BaseEntity
    {
        public int DepartmentId { get; set; }
        public decimal IncentivePercentage { get; set; }
        public DateTime EffectiveDate { get; set; }
        
        // Navigation property
        public virtual Department Department { get; set; } = null!;
    }
} 