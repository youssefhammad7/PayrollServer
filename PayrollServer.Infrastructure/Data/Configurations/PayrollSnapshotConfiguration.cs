using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PayrollServer.Domain.Entities;

namespace PayrollServer.Infrastructure.Data.Configurations
{
    public class PayrollSnapshotConfiguration : IEntityTypeConfiguration<PayrollSnapshot>
    {
        public void Configure(EntityTypeBuilder<PayrollSnapshot> builder)
        {
            builder.ToTable("PayrollSnapshots");
            
            builder.HasKey(p => p.Id);
            
            // Ensure each employee can have only one payroll snapshot per month/year
            builder.HasIndex(p => new { p.EmployeeId, p.Year, p.Month }).IsUnique();
            
            // Configure decimal columns
            builder.Property(p => p.BaseSalary)
                .IsRequired()
                .HasColumnType("decimal(18,2)");
                
            builder.Property(p => p.DepartmentIncentiveAmount)
                .HasColumnType("decimal(18,2)")
                .HasDefaultValue(0m);
                
            builder.Property(p => p.ServiceYearsIncentiveAmount)
                .HasColumnType("decimal(18,2)")
                .HasDefaultValue(0m);
                
            builder.Property(p => p.AttendanceAdjustmentAmount)
                .HasColumnType("decimal(18,2)")
                .HasDefaultValue(0m);
                
            builder.Property(p => p.GrossSalary)
                .IsRequired()
                .HasColumnType("decimal(18,2)");
                
            // Configure percentage columns
            builder.Property(p => p.DepartmentIncentivePercentage)
                .HasColumnType("decimal(5,2)");
                
            builder.Property(p => p.ServiceYearsIncentivePercentage)
                .HasColumnType("decimal(5,2)");
                
            builder.Property(p => p.AttendanceAdjustmentPercentage)
                .HasColumnType("decimal(5,2)");
                
            // Configure relationships
            builder.HasOne(p => p.Employee)
                .WithMany()
                .HasForeignKey(p => p.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
} 