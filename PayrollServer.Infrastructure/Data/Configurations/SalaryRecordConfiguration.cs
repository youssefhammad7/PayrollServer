using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PayrollServer.Domain.Entities;

namespace PayrollServer.Infrastructure.Data.Configurations
{
    public class SalaryRecordConfiguration : IEntityTypeConfiguration<SalaryRecord>
    {
        public void Configure(EntityTypeBuilder<SalaryRecord> builder)
        {
            builder.ToTable("SalaryRecords");

            builder.HasKey(s => s.Id);
            
            builder.Property(s => s.BaseSalary)
                .IsRequired()
                .HasPrecision(18, 2);
                
            builder.Property(s => s.EffectiveDate)
                .IsRequired();
                
            builder.Property(s => s.Notes)
                .HasMaxLength(500);
                
            // Configure relationship
            builder.HasOne(s => s.Employee)
                .WithMany(e => e.SalaryRecords)
                .HasForeignKey(s => s.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
} 