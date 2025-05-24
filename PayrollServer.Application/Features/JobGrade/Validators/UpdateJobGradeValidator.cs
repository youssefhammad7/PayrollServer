using FluentValidation;
using PayrollServer.Application.Features.JobGrade.Requests;

namespace PayrollServer.Application.Features.JobGrade.Validators
{
    public class UpdateJobGradeValidator : AbstractValidator<UpdateJobGradeRequest>
    {
        public UpdateJobGradeValidator()
        {
            RuleFor(j => j.Name)
                .NotEmpty().WithMessage("Job grade name is required")
                .Length(1, 50).WithMessage("Job grade name must be between 1 and 50 characters");

            RuleFor(j => j.Description)
                .MaximumLength(500).WithMessage("Description cannot exceed 500 characters");

            RuleFor(j => j.MinSalary)
                .GreaterThan(0).WithMessage("Minimum salary must be greater than zero");

            RuleFor(j => j.MaxSalary)
                .GreaterThan(j => j.MinSalary).WithMessage("Maximum salary must be greater than minimum salary");
        }
    }
} 