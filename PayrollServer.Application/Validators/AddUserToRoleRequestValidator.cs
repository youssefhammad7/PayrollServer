using FluentValidation;
using PayrollServer.Application.DTOs.Request;

namespace PayrollServer.Application.Validators
{
    public class AddUserToRoleRequestValidator : AbstractValidator<AddUserToRoleRequest>
    {
        public AddUserToRoleRequestValidator()
        {
            RuleFor(x => x.RoleName)
                .NotEmpty().WithMessage("Role name is required.");
        }
    }
} 