using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PayrollServer.Domain.Entities
{
    public class AbsenceRecord : BaseEntity
    {
        [Required]
        public int EmployeeId { get; set; }
        
        [Required]
        public int Year { get; set; }
        
        [Required]
        [Range(1, 12)]
        public int Month { get; set; }
        
        [Required]
        [Range(0, 31)]
        public int AbsenceDays { get; set; }
        
        // The calculated adjustment percentage based on absence threshold rules
        // Positive for incentive, negative for deduction
        public decimal? AdjustmentPercentage { get; set; }
        
        // Navigation properties
        [ForeignKey("EmployeeId")]
        public virtual Employee Employee { get; set; }
    }
} 