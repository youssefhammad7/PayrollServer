using System;
using System.Collections.Generic;

namespace PayrollServer.Domain.Entities
{
    public class Employee : BaseEntity
    {
        public Employee()
        {
            SalaryRecords = new HashSet<SalaryRecord>();
            AbsenceRecords = new HashSet<AbsenceRecord>();
            Incentives = new HashSet<Incentive>();
        }
        
        // Basic information
        public string EmployeeId { get; set; } = string.Empty; // Employee ID (not the primary key)
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string Address { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        
        // Employment details
        public DateTime HiringDate { get; set; }
        public string EmploymentStatus { get; set; } = "Active"; // Active, Inactive, Terminated, etc.
        
        // Foreign keys
        public int DepartmentId { get; set; }
        public int JobGradeId { get; set; }
        
        // Navigation properties
        public virtual Department Department { get; set; } = null!;
        public virtual JobGrade JobGrade { get; set; } = null!;
        public virtual ICollection<SalaryRecord> SalaryRecords { get; set; }
        public virtual ICollection<AbsenceRecord> AbsenceRecords { get; set; }
        public virtual ICollection<Incentive> Incentives { get; set; }
    }
} 