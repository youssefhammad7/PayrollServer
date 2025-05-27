using System;

namespace PayrollServer.Application.DTOs.PayrollSnapshot
{
    public class PayrollSnapshotDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public string EmployeeNumber { get; set; }
        public string DepartmentName { get; set; }
        public string JobGradeName { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthName => new DateTime(Year, Month, 1).ToString("MMMM");
        public decimal BaseSalary { get; set; }
        public decimal DepartmentIncentiveAmount { get; set; }
        public decimal ServiceYearsIncentiveAmount { get; set; }
        public decimal AttendanceAdjustmentAmount { get; set; }
        public decimal GrossSalary { get; set; }
        public decimal? DepartmentIncentivePercentage { get; set; }
        public decimal? ServiceYearsIncentivePercentage { get; set; }
        public decimal? AttendanceAdjustmentPercentage { get; set; }
        public int? AbsenceDays { get; set; }
        public int? YearsOfService { get; set; }
        
        // Additional metadata
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
} 