using FluentValidation;
using PayrollServer.Application.Features.Department.Requests;

namespace PayrollServer.Application.Features.Department.Validators
{
    public class UpdateDepartmentIncentiveValidator : AbstractValidator<UpdateDepartmentIncentiveRequest>
    {
        public UpdateDepartmentIncentiveValidator()
        {
            RuleFor(d => d.IncentivePercentage)
                .GreaterThanOrEqualTo(0).WithMessage("Incentive percentage cannot be negative")
                .LessThanOrEqualTo(100).WithMessage("Incentive percentage cannot exceed 100%");
        }
    }
} 