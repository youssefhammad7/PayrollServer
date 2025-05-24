using FluentValidation;
using PayrollServer.Application.Features.SalaryRecord.Requests;
using System;

namespace PayrollServer.Application.Features.SalaryRecord.Validators
{
    public class CreateSalaryRecordValidator : AbstractValidator<CreateSalaryRecordRequest>
    {
        public CreateSalaryRecordValidator()
        {
            RuleFor(s => s.EmployeeId)
                .NotEmpty().WithMessage("Employee ID is required")
                .GreaterThan(0).WithMessage("Invalid employee ID");

            RuleFor(s => s.BaseSalary)
                .NotEmpty().WithMessage("Base salary is required")
                .GreaterThan(0).WithMessage("Base salary must be greater than zero");

            RuleFor(s => s.EffectiveDate)
                .NotEmpty().WithMessage("Effective date is required")
                .Must(date => date.Date >= DateTime.UtcNow.Date.AddMonths(-1))
                .WithMessage("Effective date cannot be more than one month in the past");

            RuleFor(s => s.Notes)
                .MaximumLength(500).WithMessage("Notes cannot exceed 500 characters");
        }
    }
} 