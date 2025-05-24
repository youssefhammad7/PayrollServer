using System;

namespace PayrollServer.Application.DTOs.Report
{
    public class EmployeeDirectoryDto
    {
        public int Id { get; set; }
        public string EmployeeNumber { get; set; }
        public string FullName { get; set; }
        public string DepartmentName { get; set; }
        public string JobGradeName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public DateTime? HiringDate { get; set; }
        public int? YearsOfService { get; set; }
    }
} 