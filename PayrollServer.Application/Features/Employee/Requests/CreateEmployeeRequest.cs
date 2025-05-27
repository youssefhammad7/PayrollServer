using System;

namespace PayrollServer.Application.Features.Employee.Requests
{
    public class CreateEmployeeRequest
    {
        public string EmployeeId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Address { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public DateTime HiringDate { get; set; }
        public int DepartmentId { get; set; }
        public int JobGradeId { get; set; }
        public decimal? InitialSalary { get; set; }
    }
} 