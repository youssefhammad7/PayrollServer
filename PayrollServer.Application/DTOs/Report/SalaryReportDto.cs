using System;
using System.Collections.Generic;

namespace PayrollServer.Application.DTOs.Report
{
    public class SalaryReportDto
    {
        public int EmployeeId { get; set; }
        public string EmployeeNumber { get; set; }
        public string EmployeeName { get; set; }
        public string DepartmentName { get; set; }
        public string JobGradeName { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthName => new DateTime(Year, Month, 1).ToString("MMMM");
        public decimal BaseSalary { get; set; }
        public decimal GrossSalary { get; set; }
        public bool HasPayrollRecord { get; set; }
    }

    public class SalaryReportSummaryDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthName => new DateTime(Year, Month, 1).ToString("MMMM");
        public int TotalEmployees { get; set; }
        public decimal TotalBaseSalary { get; set; }
        public decimal TotalGrossSalary { get; set; }
        public decimal TotalIncentives => TotalGrossSalary - TotalBaseSalary;
        public Dictionary<string, DepartmentSalarySummaryDto> DepartmentSummaries { get; set; } = new Dictionary<string, DepartmentSalarySummaryDto>();
    }

    public class DepartmentSalarySummaryDto
    {
        public string DepartmentName { get; set; }
        public int EmployeeCount { get; set; }
        public decimal TotalBaseSalary { get; set; }
        public decimal TotalGrossSalary { get; set; }
        public decimal TotalIncentives => TotalGrossSalary - TotalBaseSalary;
    }
} 