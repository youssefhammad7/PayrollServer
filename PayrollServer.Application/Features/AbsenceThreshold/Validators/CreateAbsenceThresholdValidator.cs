using FluentValidation;
using PayrollServer.Application.Features.AbsenceThreshold.Requests;
using PayrollServer.Domain.Interfaces.Repositories;
using System.Threading;
using System.Threading.Tasks;

namespace PayrollServer.Application.Features.AbsenceThreshold.Validators
{
    public class CreateAbsenceThresholdValidator : AbstractValidator<CreateAbsenceThresholdRequest>
    {
        private readonly IUnitOfWork _unitOfWork;

        public CreateAbsenceThresholdValidator(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Name is required")
                .MaximumLength(50).WithMessage("Name cannot exceed 50 characters")
                .MustAsync(NotDuplicateName).WithMessage("A threshold with this name already exists");

            RuleFor(x => x.MinAbsenceDays)
                .NotEmpty().WithMessage("Minimum absence days is required")
                .GreaterThanOrEqualTo(0).WithMessage("Minimum absence days cannot be negative");

            RuleFor(x => x.MaxAbsenceDays)
                .GreaterThan(x => x.MinAbsenceDays)
                .When(x => x.MaxAbsenceDays.HasValue)
                .WithMessage("Maximum absence days must be greater than minimum absence days");

            RuleFor(x => x.AdjustmentPercentage)
                .NotEmpty().WithMessage("Adjustment percentage is required");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Description cannot exceed 500 characters");

            RuleFor(x => x)
                .MustAsync(NotOverlappingThresholds)
                .WithMessage("This threshold overlaps with an existing threshold");
        }

        private async Task<bool> NotDuplicateName(string name, CancellationToken token)
        {
            return !await _unitOfWork.AbsenceThresholds.IsDuplicateNameAsync(name);
        }

        private async Task<bool> NotOverlappingThresholds(CreateAbsenceThresholdRequest request, CancellationToken token)
        {
            return !await _unitOfWork.AbsenceThresholds.CheckForOverlappingThresholdsAsync(
                request.MinAbsenceDays,
                request.MaxAbsenceDays);
        }
    }
} 