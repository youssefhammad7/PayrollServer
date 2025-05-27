using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PayrollServer.Domain.Entities;

namespace PayrollServer.Infrastructure.Data.Configurations
{
    public class AbsenceThresholdConfiguration : IEntityTypeConfiguration<AbsenceThreshold>
    {
        public void Configure(EntityTypeBuilder<AbsenceThreshold> builder)
        {
            builder.ToTable("AbsenceThresholds");
            
            builder.HasKey(a => a.Id);
            
            builder.Property(a => a.Name)
                .IsRequired()
                .HasMaxLength(50);
                
            builder.Property(a => a.Description)
                .HasMaxLength(500);
                
            builder.Property(a => a.AdjustmentPercentage)
                .IsRequired()
                .HasColumnType("decimal(5,2)");
                
            // Default to active
            builder.Property(a => a.IsActive)
                .IsRequired()
                .HasDefaultValue(true);
                
            // Each threshold name should be unique
            builder.HasIndex(a => a.Name).IsUnique();
        }
    }
} 