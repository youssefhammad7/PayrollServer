using System;

namespace PayrollServer.Application.DTOs.SalaryRecord
{
    public class SalaryRecordDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public string EmployeeNumber { get; set; }
        public decimal BaseSalary { get; set; }
        public DateTime EffectiveDate { get; set; }
        public string Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
} 