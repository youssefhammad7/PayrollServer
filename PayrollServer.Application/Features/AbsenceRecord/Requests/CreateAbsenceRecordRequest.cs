namespace PayrollServer.Application.Features.AbsenceRecord.Requests
{
    public class CreateAbsenceRecordRequest
    {
        public int EmployeeId { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }
        public int AbsenceDays { get; set; }
    }
} 