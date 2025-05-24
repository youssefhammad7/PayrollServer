using System;

namespace PayrollServer.Application.Features.SalaryRecord.Requests
{
    public class UpdateSalaryRecordRequest
    {
        public decimal BaseSalary { get; set; }
        public DateTime EffectiveDate { get; set; }
        public string Notes { get; set; }
    }
} 