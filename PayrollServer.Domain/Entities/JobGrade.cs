using System.Collections.Generic;

namespace PayrollServer.Domain.Entities
{
    public class JobGrade : BaseEntity
    {
        public JobGrade()
        {
            Employees = new HashSet<Employee>();
        }
        
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        
        // Salary range for this grade
        public decimal MinSalary { get; set; }
        public decimal MaxSalary { get; set; }
        
        // Navigation property
        public virtual ICollection<Employee> Employees { get; set; }
    }
} 