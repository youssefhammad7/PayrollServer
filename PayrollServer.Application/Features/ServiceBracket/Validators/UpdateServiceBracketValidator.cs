using FluentValidation;
using PayrollServer.Application.Features.ServiceBracket.Requests;
using PayrollServer.Domain.Interfaces.Repositories;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PayrollServer.Application.Features.ServiceBracket.Validators
{
    public class UpdateServiceBracketValidator : AbstractValidator<UpdateServiceBracketRequest>
    {
        private readonly IUnitOfWork _unitOfWork;
        private int _serviceBracketId;

        public UpdateServiceBracketValidator(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;

            RuleFor(sb => sb.Name)
                .NotEmpty().WithMessage("Name is required")
                .MaximumLength(100).WithMessage("Name cannot exceed 100 characters");

            RuleFor(sb => sb.MinYearsOfService)
                .NotEmpty().WithMessage("Minimum years of service is required")
                .GreaterThanOrEqualTo(0).WithMessage("Minimum years of service must be greater than or equal to 0");

            RuleFor(sb => sb.MaxYearsOfService)
                .GreaterThan(sb => sb.MinYearsOfService)
                .When(sb => sb.MaxYearsOfService.HasValue)
                .WithMessage("Maximum years of service must be greater than minimum years of service");

            RuleFor(sb => sb.IncentivePercentage)
                .NotEmpty().WithMessage("Incentive percentage is required")
                .GreaterThan(0).WithMessage("Incentive percentage must be greater than 0")
                .LessThanOrEqualTo(100).WithMessage("Incentive percentage cannot exceed 100%");

            RuleFor(sb => sb.Description)
                .MaximumLength(500).WithMessage("Description cannot exceed 500 characters");

            // Check for overlapping brackets - validation will be set up after instantiation with SetEntityId
        }

        // Method to set the ID of the entity being updated - called before validation
        public void SetEntityId(int id)
        {
            _serviceBracketId = id;

            // Set up the overlap validation rule now that we have the ID
            RuleFor(sb => sb)
                .MustAsync(NotOverlapWithExistingBrackets)
                .WithMessage("The service bracket overlaps with an existing bracket. Please check min and max years of service.");
        }

        private async Task<bool> NotOverlapWithExistingBrackets(UpdateServiceBracketRequest request, CancellationToken cancellationToken)
        {
            var serviceBrackets = await _unitOfWork.Repository<Domain.Entities.ServiceBracket>().GetAllAsync();
            var activeBrackets = serviceBrackets.Where(sb => sb.IsActive && sb.Id != _serviceBracketId).ToList();

            foreach (var existingBracket in activeBrackets)
            {
                // Check if updated bracket's range overlaps with existing bracket's range
                bool overlaps = DoRangesOverlap(
                    request.MinYearsOfService, 
                    request.MaxYearsOfService, 
                    existingBracket.MinYearsOfService, 
                    existingBracket.MaxYearsOfService);

                if (overlaps)
                {
                    return false;
                }
            }

            return true;
        }

        private bool DoRangesOverlap(int min1, int? max1, int min2, int? max2)
        {
            // If either range is unlimited (no max), we need special handling
            if (!max1.HasValue && !max2.HasValue)
            {
                // Both ranges are unlimited, they will overlap if either min is >= the other min
                return true;
            }
            else if (!max1.HasValue)
            {
                // First range is unlimited, it overlaps if min1 <= max2
                return min1 <= max2;
            }
            else if (!max2.HasValue)
            {
                // Second range is unlimited, it overlaps if min2 <= max1
                return min2 <= max1;
            }
            else
            {
                // Both ranges have upper bounds
                // They overlap if one range's min is <= the other's max AND the other's min is <= this range's max
                return min1 <= max2 && min2 <= max1;
            }
        }
    }
} 