using System;

namespace PayrollServer.Application.DTOs.Report
{
    public class AttendanceReportDto
    {
        public int EmployeeId { get; set; }
        public string EmployeeNumber { get; set; }
        public string EmployeeName { get; set; }
        public string DepartmentName { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthName => new DateTime(Year, Month, 1).ToString("MMMM");
        public int AbsenceDays { get; set; }
        public decimal? AdjustmentPercentage { get; set; }
        public decimal AdjustmentAmount { get; set; }
        public DateTime? LastUpdated { get; set; }
    }
} 