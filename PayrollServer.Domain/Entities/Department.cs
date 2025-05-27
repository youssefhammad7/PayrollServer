using System;
using System.Collections.Generic;

namespace PayrollServer.Domain.Entities
{
    public class Department : BaseEntity
    {
        public Department()
        {
            Employees = new HashSet<Employee>();
            IncentiveHistories = new HashSet<DepartmentIncentiveHistory>();
        }

        public string Name { get; set; } = string.Empty;
        
        // Current incentive percentage for the department (nullable)
        public decimal? IncentivePercentage { get; set; }
        
        // Date when the current incentive percentage was set
        public DateTime? IncentiveSetDate { get; set; }
        
        // Navigation properties
        public virtual ICollection<Employee> Employees { get; set; }
        public virtual ICollection<DepartmentIncentiveHistory> IncentiveHistories { get; set; }
    }
} 