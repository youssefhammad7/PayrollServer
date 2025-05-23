using FluentValidation;
using PayrollServer.Application.DTOs.Request;

namespace PayrollServer.Application.Validators
{
    public class ForgotPasswordValidator : AbstractValidator<ForgotPasswordRequest>
    {
        public ForgotPasswordValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("A valid email is required");
        }
    }
}
 