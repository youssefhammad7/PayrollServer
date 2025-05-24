using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PayrollServer.Domain.Entities;

namespace PayrollServer.Infrastructure.Data.Configurations
{
    public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
    {
        public void Configure(EntityTypeBuilder<Employee> builder)
        {
            builder.ToTable("Employees");

            builder.HasKey(e => e.Id);
            
            builder.Property(e => e.EmployeeNumber)
                .IsRequired()
                .HasMaxLength(20);
                
            builder.Property(e => e.FirstName)
                .IsRequired()
                .HasMaxLength(50);
                
            builder.Property(e => e.LastName)
                .IsRequired()
                .HasMaxLength(50);
                
            builder.Property(e => e.Address)
                .HasMaxLength(200);
                
            builder.Property(e => e.PhoneNumber)
                .HasMaxLength(20);
                
            builder.Property(e => e.Email)
                .HasMaxLength(100);
                
            builder.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(20)
                .HasDefaultValue("Active");
                
            // Temporarily remove filtered unique indexes
            builder.HasIndex(e => e.EmployeeNumber)
                .IsUnique();
                
            builder.HasIndex(e => e.Email)
                .IsUnique();
                
            // Configure relationships
            builder.HasOne(e => e.Department)
                .WithMany(d => d.Employees)
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);
                
            builder.HasOne(e => e.JobGrade)
                .WithMany(j => j.Employees)
                .HasForeignKey(e => e.JobGradeId)
                .OnDelete(DeleteBehavior.Restrict);
                
            builder.HasMany(e => e.SalaryRecords)
                .WithOne(s => s.Employee)
                .HasForeignKey(s => s.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);
                
            builder.HasMany(e => e.AbsenceRecords)
                .WithOne(a => a.Employee)
                .HasForeignKey(a => a.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
} 