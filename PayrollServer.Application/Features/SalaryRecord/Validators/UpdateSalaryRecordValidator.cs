using FluentValidation;
using PayrollServer.Application.Features.SalaryRecord.Requests;
using System;

namespace PayrollServer.Application.Features.SalaryRecord.Validators
{
    public class UpdateSalaryRecordValidator : AbstractValidator<UpdateSalaryRecordRequest>
    {
        public UpdateSalaryRecordValidator()
        {
            RuleFor(s => s.BaseSalary)
                .NotEmpty().WithMessage("Base salary is required")
                .GreaterThan(0).WithMessage("Base salary must be greater than zero");

            RuleFor(s => s.EffectiveDate)
                .NotEmpty().WithMessage("Effective date is required");

            RuleFor(s => s.Notes)
                .MaximumLength(500).WithMessage("Notes cannot exceed 500 characters");
        }
    }
} 