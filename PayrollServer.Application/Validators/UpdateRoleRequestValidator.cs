using FluentValidation;
using PayrollServer.Application.DTOs.Request;

namespace PayrollServer.Application.Validators
{
    public class UpdateRoleRequestValidator : AbstractValidator<UpdateRoleRequest>
    {
        public UpdateRoleRequestValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Role name is required.")
                .MinimumLength(2).WithMessage("Role name must be at least 2 characters.")
                .MaximumLength(50).WithMessage("Role name cannot exceed 50 characters.");

            When(x => x.Description != null, () =>
            {
                RuleFor(x => x.Description)
                    .MaximumLength(250).WithMessage("Description cannot exceed 250 characters.");
            });
        }
    }
} 