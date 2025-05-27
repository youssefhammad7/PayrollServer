using System.ComponentModel.DataAnnotations;

namespace PayrollServer.Domain.Entities
{
    public class AbsenceThreshold : BaseEntity
    {
        [Required]
        [StringLength(50)]
        public string Name { get; set; }
        
        [Required]
        public int MinAbsenceDays { get; set; }
        
        // MaxAbsenceDays is nullable to allow for open-ended upper ranges
        public int? MaxAbsenceDays { get; set; }
        
        [Required]
        // Positive for incentive, negative for deduction
        public decimal AdjustmentPercentage { get; set; }
        
        [StringLength(500)]
        public string Description { get; set; }
        
        public bool IsActive { get; set; } = true;
    }
} 