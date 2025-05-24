namespace PayrollServer.Application.Features.JobGrade.Requests
{
    public class UpdateJobGradeRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal MinSalary { get; set; }
        public decimal MaxSalary { get; set; }
    }
} 