using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PayrollServer.Domain.Entities;

namespace PayrollServer.Infrastructure.Data.Configurations
{
    public class IncentiveConfiguration : IEntityTypeConfiguration<Incentive>
    {
        public void Configure(EntityTypeBuilder<Incentive> builder)
        {
            builder.ToTable("Incentives");

            builder.HasKey(i => i.Id);

            builder.Property(i => i.EmployeeId)
                .IsRequired();

            builder.Property(i => i.Title)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(i => i.Description)
                .HasMaxLength(500);

            builder.Property(i => i.Amount)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            builder.Property(i => i.Date)
                .IsRequired();

            builder.Property(i => i.Type)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(i => i.IsTaxable)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(i => i.CreatedAt)
                .IsRequired();

            // Relationships
            builder.HasOne(i => i.Employee)
                .WithMany(e => e.Incentives)
                .HasForeignKey(i => i.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}