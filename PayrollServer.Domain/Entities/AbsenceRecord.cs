using System;

namespace PayrollServer.Domain.Entities
{
    public class AbsenceRecord : BaseEntity
    {
        public int EmployeeId { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        public int DaysAbsent { get; set; }
        public string? Reason { get; set; }
        
        // Navigation property
        public virtual Employee Employee { get; set; } = null!;
    }
} 