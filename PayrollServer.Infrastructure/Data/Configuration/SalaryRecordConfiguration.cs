using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PayrollServer.Domain.Entities;

namespace PayrollServer.Infrastructure.Data.Configuration
{
    public class SalaryRecordConfiguration : IEntityTypeConfiguration<SalaryRecord>
    {
        public void Configure(EntityTypeBuilder<SalaryRecord> builder)
        {
            builder.ToTable("SalaryRecords");
            
            builder.HasKey(s => s.Id);
            
            builder.Property(s => s.EmployeeId)
                .IsRequired();
                
            builder.Property(s => s.BaseSalary)
                .HasColumnType("decimal(18,2)")
                .IsRequired();
                
            builder.Property(s => s.EffectiveDate)
                .IsRequired();
                
            builder.Property(s => s.Notes)
                .HasMaxLength(500);
                
            builder.Property(s => s.CreatedAt)
                .IsRequired();
                
            // Relationships
            builder.HasOne(s => s.Employee)
                .WithMany(e => e.SalaryRecords)
                .HasForeignKey(s => s.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);
                
            // Unique index for employee and effective date
            builder.HasIndex(s => new { s.EmployeeId, s.EffectiveDate })
                .IsUnique()
                .HasFilter("[EffectiveDate] IS NOT NULL");
        }
    }
} 