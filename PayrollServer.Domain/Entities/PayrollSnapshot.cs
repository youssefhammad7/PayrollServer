using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PayrollServer.Domain.Entities
{
    public class PayrollSnapshot : BaseEntity
    {
        [Required]
        public int EmployeeId { get; set; }
        
        [Required]
        public int Year { get; set; }
        
        [Required]
        [Range(1, 12)]
        public int Month { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal BaseSalary { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal DepartmentIncentiveAmount { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal ServiceYearsIncentiveAmount { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal AttendanceAdjustmentAmount { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal GrossSalary { get; set; }
        
        // Percentages for historical reference
        [Column(TypeName = "decimal(5,2)")]
        public decimal? DepartmentIncentivePercentage { get; set; }
        
        [Column(TypeName = "decimal(5,2)")]
        public decimal? ServiceYearsIncentivePercentage { get; set; }
        
        [Column(TypeName = "decimal(5,2)")]
        public decimal? AttendanceAdjustmentPercentage { get; set; }
        
        // Additional metadata for snapshots
        public int? AbsenceDays { get; set; }
        
        public int? YearsOfService { get; set; }
        
        // Navigation properties
        [ForeignKey("EmployeeId")]
        public virtual Employee Employee { get; set; }
    }
} 