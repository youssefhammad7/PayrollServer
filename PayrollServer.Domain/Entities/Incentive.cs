using System;

namespace PayrollServer.Domain.Entities
{
    public class Incentive : BaseEntity
    {
        public int EmployeeId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string Type { get; set; }
        public bool IsTaxable { get; set; }
        
        // Navigation properties
        public virtual Employee Employee { get; set; }
    }
} 