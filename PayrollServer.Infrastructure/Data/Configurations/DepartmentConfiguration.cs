using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PayrollServer.Domain.Entities;

namespace PayrollServer.Infrastructure.Data.Configurations
{
    public class DepartmentConfiguration : IEntityTypeConfiguration<Department>
    {
        public void Configure(EntityTypeBuilder<Department> builder)
        {
            builder.ToTable("Departments");

            builder.HasKey(d => d.Id);
            
            builder.Property(d => d.Name)
                .IsRequired()
                .HasMaxLength(100);
                
            builder.Property(d => d.IncentivePercentage)
                .HasPrecision(5, 2);
                
            // Temporarily remove filtered unique index
            builder.HasIndex(d => d.Name)
                .IsUnique();
                
            // Configure relationships
            builder.HasMany(d => d.IncentiveHistories)
                .WithOne(h => h.Department)
                .HasForeignKey(h => h.DepartmentId)
                .OnDelete(DeleteBehavior.Cascade);
                
            builder.HasMany(d => d.Employees)
                .WithOne(e => e.Department)
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 