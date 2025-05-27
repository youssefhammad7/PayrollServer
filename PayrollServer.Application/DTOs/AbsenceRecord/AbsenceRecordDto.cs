using System;

namespace PayrollServer.Application.DTOs.AbsenceRecord
{
    public class AbsenceRecordDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthName => new DateTime(Year, Month, 1).ToString("MMMM");
        public int AbsenceDays { get; set; }
        public decimal? AdjustmentPercentage { get; set; }
        
        // Additional metadata
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
} 