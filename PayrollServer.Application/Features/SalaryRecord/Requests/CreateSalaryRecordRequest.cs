using System;

namespace PayrollServer.Application.Features.SalaryRecord.Requests
{
    public class CreateSalaryRecordRequest
    {
        public int EmployeeId { get; set; }
        public decimal BaseSalary { get; set; }
        public DateTime EffectiveDate { get; set; }
        public string Notes { get; set; }
    }
} 