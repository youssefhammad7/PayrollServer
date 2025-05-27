using FluentValidation;
using PayrollServer.Application.Features.Department.Requests;

namespace PayrollServer.Application.Features.Department.Validators
{
    public class CreateDepartmentValidator : AbstractValidator<CreateDepartmentRequest>
    {
        public CreateDepartmentValidator()
        {
            RuleFor(d => d.Name)
                .NotEmpty().WithMessage("Department name is required")
                .Length(2, 100).WithMessage("Department name must be between 2 and 100 characters");

            RuleFor(d => d.IncentivePercentage)
                .GreaterThanOrEqualTo(0).WithMessage("Incentive percentage cannot be negative")
                .LessThanOrEqualTo(100).WithMessage("Incentive percentage cannot exceed 100%")
                .When(d => d.IncentivePercentage.HasValue);
        }
    }
} 