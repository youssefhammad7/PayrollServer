using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.Logging;
using PayrollServer.Application.DTOs.ServiceBracket;
using PayrollServer.Application.Features.ServiceBracket.Requests;
using PayrollServer.Application.Features.ServiceBracket.Validators;
using PayrollServer.Application.Interfaces.Services;
using PayrollServer.Domain.Exceptions;
using PayrollServer.Domain.Interfaces.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PayrollServer.Application.Services
{
    public class ServiceBracketService : IServiceBracketService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IValidator<CreateServiceBracketRequest> _createValidator;
        private readonly UpdateServiceBracketValidator _updateValidator;
        private readonly ILogger<ServiceBracketService> _logger;

        public ServiceBracketService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IValidator<CreateServiceBracketRequest> createValidator,
            UpdateServiceBracketValidator updateValidator,
            ILogger<ServiceBracketService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
            _logger = logger;
        }

        public async Task<IEnumerable<ServiceBracketDto>> GetAllServiceBracketsAsync(bool activeOnly = false)
        {
            IEnumerable<Domain.Entities.ServiceBracket> serviceBrackets;
            
            if (activeOnly)
            {
                serviceBrackets = await _unitOfWork.ServiceBrackets.GetActiveServiceBracketsAsync();
            }
            else
            {
                serviceBrackets = await _unitOfWork.ServiceBrackets.GetAllAsync();
                // Order by min years of service for logical presentation
                serviceBrackets = serviceBrackets.OrderBy(sb => sb.MinYearsOfService);
            }
            
            return _mapper.Map<IEnumerable<ServiceBracketDto>>(serviceBrackets);
        }

        public async Task<ServiceBracketDto> GetServiceBracketByIdAsync(int id)
        {
            var serviceBracket = await _unitOfWork.ServiceBrackets.GetByIdAsync(id);
            
            if (serviceBracket == null)
            {
                throw new EntityNotFoundException("ServiceBracket", id);
            }
            
            return _mapper.Map<ServiceBracketDto>(serviceBracket);
        }

        public async Task<ServiceBracketDto> GetServiceBracketForYearsOfServiceAsync(int yearsOfService)
        {
            var matchingBracket = await _unitOfWork.ServiceBrackets.GetServiceBracketForYearsOfServiceAsync(yearsOfService);
            
            if (matchingBracket == null)
            {
                throw new BusinessRuleViolationException(
                    "No matching service bracket", 
                    $"No service bracket found for {yearsOfService} years of service");
            }
            
            return _mapper.Map<ServiceBracketDto>(matchingBracket);
        }

        public async Task<ServiceBracketDto> CreateServiceBracketAsync(CreateServiceBracketRequest request)
        {
            // Validate request
            var validationResult = await _createValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            // Create new service bracket
            var serviceBracket = _mapper.Map<Domain.Entities.ServiceBracket>(request);
            
            await _unitOfWork.ServiceBrackets.AddAsync(serviceBracket);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<ServiceBracketDto>(serviceBracket);
        }

        public async Task<ServiceBracketDto> UpdateServiceBracketAsync(int id, UpdateServiceBracketRequest request)
        {
            // Set the ID for the validator to check for overlaps excluding the current entity
            _updateValidator.SetEntityId(id);
            
            // Validate request
            var validationResult = await _updateValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            // Get existing service bracket
            var serviceBracket = await _unitOfWork.ServiceBrackets.GetByIdAsync(id);
            if (serviceBracket == null)
            {
                throw new EntityNotFoundException("ServiceBracket", id);
            }

            // Update service bracket
            serviceBracket.Name = request.Name;
            serviceBracket.MinYearsOfService = request.MinYearsOfService;
            serviceBracket.MaxYearsOfService = request.MaxYearsOfService;
            serviceBracket.IncentivePercentage = request.IncentivePercentage;
            serviceBracket.Description = request.Description;
            serviceBracket.IsActive = request.IsActive;
            
            _unitOfWork.ServiceBrackets.Update(serviceBracket);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<ServiceBracketDto>(serviceBracket);
        }

        public async Task<bool> DeleteServiceBracketAsync(int id)
        {
            // Get existing service bracket
            var serviceBracket = await _unitOfWork.ServiceBrackets.GetByIdAsync(id);
            if (serviceBracket == null)
            {
                throw new EntityNotFoundException("ServiceBracket", id);
            }

            // Delete service bracket (or soft delete by marking as inactive)
            serviceBracket.IsActive = false;
            _unitOfWork.ServiceBrackets.Update(serviceBracket);
            await _unitOfWork.CompleteAsync();

            return true;
        }

        public async Task<bool> CheckForOverlappingBracketsAsync(int minYears, int? maxYears, int? excludeId = null)
        {
            return await _unitOfWork.ServiceBrackets.CheckForOverlappingBracketsAsync(minYears, maxYears, excludeId);
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
                return min1 <= max2.Value && min2 <= max1.Value;
            }
        }
    }
} 