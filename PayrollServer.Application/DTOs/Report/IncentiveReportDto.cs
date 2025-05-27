using System;

namespace PayrollServer.Application.DTOs.Report
{
    public class IncentiveReportDto
    {
        public int EmployeeId { get; set; }
        public string EmployeeNumber { get; set; }
        public string EmployeeName { get; set; }
        public string DepartmentName { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthName => new DateTime(Year, Month, 1).ToString("MMMM");
        public decimal BaseSalary { get; set; }
        public decimal DepartmentIncentiveAmount { get; set; }
        public decimal ServiceYearsIncentiveAmount { get; set; }
        public decimal AttendanceAdjustmentAmount { get; set; }
        public decimal TotalIncentives => DepartmentIncentiveAmount + ServiceYearsIncentiveAmount + 
            (AttendanceAdjustmentAmount > 0 ? AttendanceAdjustmentAmount : 0);
        public decimal TotalDeductions => AttendanceAdjustmentAmount < 0 ? Math.Abs(AttendanceAdjustmentAmount) : 0;
    }
} 