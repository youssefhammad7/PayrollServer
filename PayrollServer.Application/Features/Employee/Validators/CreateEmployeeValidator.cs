using FluentValidation;
using PayrollServer.Application.Features.Employee.Requests;
using System;

namespace PayrollServer.Application.Features.Employee.Validators
{
    public class CreateEmployeeValidator : AbstractValidator<CreateEmployeeRequest>
    {
        public CreateEmployeeValidator()
        {
            RuleFor(e => e.EmployeeId)
                .NotEmpty().WithMessage("Employee ID is required")
                .MaximumLength(20).WithMessage("Employee ID cannot exceed 20 characters");

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

            RuleFor(e => e.HireDate)
                .NotEmpty().WithMessage("Hiring date is required")
                .LessThanOrEqualTo(DateTime.UtcNow).WithMessage("Hiring date cannot be in the future");

            RuleFor(e => e.DepartmentId)
                .NotEmpty().WithMessage("Department is required")
                .GreaterThan(0).WithMessage("Invalid department");

            RuleFor(e => e.JobGradeId)
                .NotEmpty().WithMessage("Job grade is required")
                .GreaterThan(0).WithMessage("Invalid job grade");

            // Initial salary is optional during employee creation
            // If provided, it will be validated by the service against the job grade min/max
            When(e => e.InitialSalary.HasValue, () =>
            {
                RuleFor(e => e.InitialSalary.Value)
                    .GreaterThan(0).WithMessage("Initial salary must be greater than zero");
            });
        }
    }
} 