using FluentValidation;
using PayrollServer.Application.Features.Department.Requests;

namespace PayrollServer.Application.Features.Department.Validators
{
    public class UpdateDepartmentValidator : AbstractValidator<UpdateDepartmentRequest>
    {
        public UpdateDepartmentValidator()
        {
            RuleFor(d => d.Name)
                .NotEmpty().WithMessage("Department name is required")
                .Length(2, 100).WithMessage("Department name must be between 2 and 100 characters");
        }
    }
} 