using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PayrollServer.Domain.Entities;

namespace PayrollServer.Infrastructure.Data.Configurations
{
    public class DepartmentIncentiveHistoryConfiguration : IEntityTypeConfiguration<DepartmentIncentiveHistory>
    {
        public void Configure(EntityTypeBuilder<DepartmentIncentiveHistory> builder)
        {
            builder.ToTable("DepartmentIncentiveHistories");

            builder.HasKey(h => h.Id);
            
            builder.Property(h => h.IncentivePercentage)
                .IsRequired()
                .HasPrecision(5, 2);
                
            builder.Property(h => h.EffectiveDate)
                .IsRequired();
                
            // Configure relationship
            builder.HasOne(h => h.Department)
                .WithMany(d => d.IncentiveHistories)
                .HasForeignKey(h => h.DepartmentId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
} 