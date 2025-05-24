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
            
            builder.Property(a => a.Month)
                .IsRequired();
                
            builder.Property(a => a.Year)
                .IsRequired();
                
            builder.Property(a => a.DaysAbsent)
                .IsRequired();
                
            builder.Property(a => a.Reason)
                .HasMaxLength(500);
                
            // Configure relationship
            builder.HasOne(a => a.Employee)
                .WithMany(e => e.AbsenceRecords)
                .HasForeignKey(a => a.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);
                
            // Temporarily remove filtered unique index
            builder.HasIndex(a => new { a.EmployeeId, a.Month, a.Year });
        }
    }
} 