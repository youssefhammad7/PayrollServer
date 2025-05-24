using FluentValidation;
using PayrollServer.Application.Features.Employee.Requests;
using System;

namespace PayrollServer.Application.Features.Employee.Validators
{
    public class UpdateEmployeeValidator : AbstractValidator<UpdateEmployeeRequest>
    {
        public UpdateEmployeeValidator()
        {
            RuleFor(e => e.FirstName)
                .NotEmpty().WithMessage("First name is required")
                .MaximumLength(50).WithMessage("First name cannot exceed 50 characters");

            RuleFor(e => e.LastName)
                .NotEmpty().WithMessage("Last name is required")
                .MaximumLength(50).WithMessage("Last name cannot exceed 50 characters");

            RuleFor(e => e.DateOfBirth)
                .NotEmpty().WithMessage("Date of birth is required")
                .LessThan(DateTime.UtcNow.AddYears(-18)).WithMessage("Employee must be at least 18 years old");

            RuleFor(e => e.Address)
                .NotEmpty().WithMessage("Address is required")
                .MaximumLength(200).WithMessage("Address cannot exceed 200 characters");

            RuleFor(e => e.PhoneNumber)
                .NotEmpty().WithMessage("Phone number is required")
                .MaximumLength(20).WithMessage("Phone number cannot exceed 20 characters");

            RuleFor(e => e.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid email format")
                .MaximumLength(100).WithMessage("Email cannot exceed 100 characters");

            RuleFor(e => e.DepartmentId)
                .NotEmpty().WithMessage("Department is required")
                .GreaterThan(0).WithMessage("Invalid department");

            RuleFor(e => e.JobGradeId)
                .NotEmpty().WithMessage("Job grade is required")
                .GreaterThan(0).WithMessage("Invalid job grade");

            RuleFor(e => e.EmploymentStatus)
                .NotEmpty().WithMessage("Employment status is required")
                .MaximumLength(20).WithMessage("Employment status cannot exceed 20 characters")
                .Must(status => status == "Active" || status == "On Leave" || status == "Terminated")
                .WithMessage("Employment status must be one of: Active, On Leave, Terminated");
        }
    }
} 