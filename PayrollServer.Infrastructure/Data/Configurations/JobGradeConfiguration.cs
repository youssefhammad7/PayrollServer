using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PayrollServer.Domain.Entities;

namespace PayrollServer.Infrastructure.Data.Configurations
{
    public class JobGradeConfiguration : IEntityTypeConfiguration<JobGrade>
    {
        public void Configure(EntityTypeBuilder<JobGrade> builder)
        {
            builder.ToTable("JobGrades");

            builder.HasKey(j => j.Id);
            
            builder.Property(j => j.Name)
                .IsRequired()
                .HasMaxLength(50);
                
            builder.Property(j => j.Description)
                .HasMaxLength(500);
                
            builder.Property(j => j.MinSalary)
                .IsRequired()
                .HasPrecision(18, 2);
                
            builder.Property(j => j.MaxSalary)
                .IsRequired()
                .HasPrecision(18, 2);
                
            // Temporarily remove filtered unique index
            builder.HasIndex(j => j.Name)
                .IsUnique();
                
            // Configure relationships
            builder.HasMany(j => j.Employees)
                .WithOne(e => e.JobGrade)
                .HasForeignKey(e => e.JobGradeId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 