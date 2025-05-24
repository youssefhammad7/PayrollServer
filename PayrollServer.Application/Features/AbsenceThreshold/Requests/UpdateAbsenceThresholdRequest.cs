namespace PayrollServer.Application.Features.AbsenceThreshold.Requests
{
    public class UpdateAbsenceThresholdRequest
    {
        public string Name { get; set; }
        public int MinAbsenceDays { get; set; }
        public int? MaxAbsenceDays { get; set; }
        public decimal AdjustmentPercentage { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
    }
} 