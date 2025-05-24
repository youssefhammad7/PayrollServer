using System;

namespace PayrollServer.Domain.Entities
{
    public class SalaryRecord : BaseEntity
    {
        public int EmployeeId { get; set; }
        public decimal BaseSalary { get; set; }
        public DateTime EffectiveDate { get; set; }
        public string? Notes { get; set; }
        
        // Navigation property
        public virtual Employee Employee { get; set; } = null!;
    }
} 