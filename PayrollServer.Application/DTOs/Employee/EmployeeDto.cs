using System;

namespace PayrollServer.Application.DTOs.Employee
{
    public class EmployeeDto
    {
        public int Id { get; set; }
        public string EmployeeId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string FullName => $"{FirstName} {LastName}";
        public DateTime DateOfBirth { get; set; }
        public string Address { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public DateTime HiringDate { get; set; }
        public string EmploymentStatus { get; set; }
        
        // Department information
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; }
        public decimal? DepartmentIncentivePercentage { get; set; }
        
        // Job Grade information
        public int JobGradeId { get; set; }
        public string JobGradeName { get; set; }
        public decimal JobGradeMinSalary { get; set; }
        public decimal JobGradeMaxSalary { get; set; }
        
        // Current salary information
        public decimal? CurrentSalary { get; set; }
        public DateTime? SalaryEffectiveDate { get; set; }
        
        // Additional metadata
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
} 