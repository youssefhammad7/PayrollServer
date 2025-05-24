namespace PayrollServer.Application.Features.JobGrade.Requests
{
    public class CreateJobGradeRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal MinSalary { get; set; }
        public decimal MaxSalary { get; set; }
    }
} 