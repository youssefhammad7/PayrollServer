using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PayrollServer.Domain.Entities;

namespace PayrollServer.Infrastructure.Data.Configuration
{
    public class ServiceBracketConfiguration : IEntityTypeConfiguration<ServiceBracket>
    {
        public void Configure(EntityTypeBuilder<ServiceBracket> builder)
        {
            builder.ToTable("ServiceBrackets");
            
            builder.HasKey(sb => sb.Id);
            
            builder.Property(sb => sb.Name)
                .HasMaxLength(100)
                .IsRequired();
                
            builder.Property(sb => sb.MinYearsOfService)
                .IsRequired();
                
            builder.Property(sb => sb.IncentivePercentage)
                .HasColumnType("decimal(5,2)")
                .IsRequired();
                
            builder.Property(sb => sb.Description)
                .HasMaxLength(500);
                
            builder.Property(sb => sb.IsActive)
                .IsRequired()
                .HasDefaultValue(true);
                
            builder.Property(sb => sb.CreatedAt)
                .IsRequired();
        }
    }
} 