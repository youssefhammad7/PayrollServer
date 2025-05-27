using FluentValidation;
using PayrollServer.Application.Features.AbsenceRecord.Requests;

namespace PayrollServer.Application.Features.AbsenceRecord.Validators
{
    public class UpdateAbsenceRecordValidator : AbstractValidator<UpdateAbsenceRecordRequest>
    {
        public UpdateAbsenceRecordValidator()
        {
            RuleFor(x => x.AbsenceDays)
                .NotEmpty().WithMessage("Absence days is required")
                .GreaterThanOrEqualTo(0).WithMessage("Absence days cannot be negative")
                .LessThanOrEqualTo(31).WithMessage("Absence days cannot exceed 31");
        }
    }
} 