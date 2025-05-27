using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PayrollServer.Domain.Entities;

namespace PayrollServer.Infrastructure.Data.Configurations
{
    public class AbsenceRecordConfiguration : IEntityTypeConfiguration<AbsenceRecord>
    {
        public void Configure(EntityTypeBuilder<AbsenceRecord> builder)
        {
            builder.ToTable("AbsenceRecords");
            
            builder.HasKey(a => a.Id);
            
            // Ensure each employee can have only one absence record per month/year
            builder.HasIndex(a => new { a.EmployeeId, a.Year, a.Month }).IsUnique();
            
            // Configure relationships
            builder.HasOne(a => a.Employee)
                .WithMany(e => e.AbsenceRecords)
                .HasForeignKey(a => a.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
} 