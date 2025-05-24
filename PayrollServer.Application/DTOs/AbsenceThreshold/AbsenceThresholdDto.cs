using System;

namespace PayrollServer.Application.DTOs.AbsenceThreshold
{
    public class AbsenceThresholdDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int MinAbsenceDays { get; set; }
        public int? MaxAbsenceDays { get; set; }
        public decimal AdjustmentPercentage { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        
        // Additional metadata
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
} 