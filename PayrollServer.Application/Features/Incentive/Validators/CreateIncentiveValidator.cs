using FluentValidation;
using PayrollServer.Application.Features.Incentive.Requests;
using System;

namespace PayrollServer.Application.Features.Incentive.Validators
{
    public class CreateIncentiveValidator : AbstractValidator<CreateIncentiveRequest>
    {
        public CreateIncentiveValidator()
        {
            RuleFor(i => i.EmployeeId)
                .NotEmpty().WithMessage("Employee ID is required")
                .GreaterThan(0).WithMessage("Invalid employee ID");

            RuleFor(i => i.Title)
                .NotEmpty().WithMessage("Title is required")
                .MaximumLength(100).WithMessage("Title cannot exceed 100 characters");

            RuleFor(i => i.Description)
                .MaximumLength(500).WithMessage("Description cannot exceed 500 characters");

            RuleFor(i => i.Amount)
                .NotEmpty().WithMessage("Amount is required")
                .GreaterThan(0).WithMessage("Amount must be greater than zero");

            RuleFor(i => i.Date)
                .NotEmpty().WithMessage("Date is required")
                .Must(date => date.Date <= DateTime.UtcNow.Date)
                .WithMessage("Date cannot be in the future");

            RuleFor(i => i.Type)
                .NotEmpty().WithMessage("Type is required")
                .MaximumLength(50).WithMessage("Type cannot exceed 50 characters")
                .Must(type => type == "Bonus" || type == "Commission" || type == "Allowance" || type == "Other")
                .WithMessage("Type must be one of: Bonus, Commission, Allowance, Other");
        }
    }
} 