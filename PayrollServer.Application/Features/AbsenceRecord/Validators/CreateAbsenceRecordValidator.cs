using FluentValidation;
using PayrollServer.Application.Features.AbsenceRecord.Requests;
using PayrollServer.Domain.Interfaces.Repositories;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PayrollServer.Application.Features.AbsenceRecord.Validators
{
    public class CreateAbsenceRecordValidator : AbstractValidator<CreateAbsenceRecordRequest>
    {
        private readonly IUnitOfWork _unitOfWork;

        public CreateAbsenceRecordValidator(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;

            RuleFor(x => x.EmployeeId)
                .NotEmpty().WithMessage("Employee ID is required")
                .MustAsync(EmployeeExists).WithMessage("Employee does not exist");

            RuleFor(x => x.Year)
                .NotEmpty().WithMessage("Year is required")
                .GreaterThanOrEqualTo(DateTime.Now.Year - 5).WithMessage("Year cannot be more than 5 years in the past")
                .LessThanOrEqualTo(DateTime.Now.Year + 1).WithMessage("Year cannot be more than 1 year in the future");

            RuleFor(x => x.Month)
                .NotEmpty().WithMessage("Month is required")
                .InclusiveBetween(1, 12).WithMessage("Month must be between 1 and 12");

            RuleFor(x => x.AbsenceDays)
                .NotEmpty().WithMessage("Absence days is required")
                .GreaterThanOrEqualTo(0).WithMessage("Absence days cannot be negative")
                .LessThanOrEqualTo(31).WithMessage("Absence days cannot exceed 31");

            RuleFor(x => x)
                .MustAsync(NotDuplicateMonth).WithMessage("An absence record already exists for this employee for the specified month/year");
        }

        private async Task<bool> EmployeeExists(int employeeId, CancellationToken token)
        {
            return await _unitOfWork.Employees.AnyAsync(e => e.Id == employeeId);
        }

        private async Task<bool> NotDuplicateMonth(CreateAbsenceRecordRequest request, CancellationToken token)
        {
            return !await _unitOfWork.AbsenceRecords.IsDuplicateMonthAsync(request.EmployeeId, request.Year, request.Month);
        }
    }
} 