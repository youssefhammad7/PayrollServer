using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.Logging;
using PayrollServer.Application.DTOs.AbsenceThreshold;
using PayrollServer.Application.Features.AbsenceThreshold.Requests;
using PayrollServer.Application.Features.AbsenceThreshold.Validators;
using PayrollServer.Application.Interfaces.Services;
using PayrollServer.Domain.Exceptions;
using PayrollServer.Domain.Interfaces.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PayrollServer.Application.Services
{
    public class AbsenceThresholdService : IAbsenceThresholdService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IValidator<CreateAbsenceThresholdRequest> _createValidator;
        private readonly UpdateAbsenceThresholdValidator _updateValidator;
        private readonly ILogger<AbsenceThresholdService> _logger;

        public AbsenceThresholdService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IValidator<CreateAbsenceThresholdRequest> createValidator,
            UpdateAbsenceThresholdValidator updateValidator,
            ILogger<AbsenceThresholdService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
            _logger = logger;
        }

        public async Task<IEnumerable<AbsenceThresholdDto>> GetAllAbsenceThresholdsAsync(bool activeOnly = false)
        {
            IEnumerable<Domain.Entities.AbsenceThreshold> thresholds;
            
            if (activeOnly)
            {
                thresholds = await _unitOfWork.AbsenceThresholds.GetActiveThresholdsAsync();
            }
            else
            {
                thresholds = await _unitOfWork.AbsenceThresholds.GetAllAsync();
                // Order by min absence days for logical presentation
                thresholds = thresholds.OrderBy(t => t.MinAbsenceDays);
            }
            
            return _mapper.Map<IEnumerable<AbsenceThresholdDto>>(thresholds);
        }

        public async Task<AbsenceThresholdDto> GetAbsenceThresholdByIdAsync(int id)
        {
            var threshold = await _unitOfWork.AbsenceThresholds.GetByIdAsync(id);
            
            if (threshold == null)
            {
                throw new EntityNotFoundException("AbsenceThreshold", id);
            }
            
            return _mapper.Map<AbsenceThresholdDto>(threshold);
        }

        public async Task<AbsenceThresholdDto> GetThresholdForAbsenceDaysAsync(int absenceDays)
        {
            var threshold = await _unitOfWork.AbsenceThresholds.GetThresholdForAbsenceDaysAsync(absenceDays);
            
            if (threshold == null)
            {
                throw new BusinessRuleViolationException(
                    "No matching absence threshold", 
                    $"No threshold found for {absenceDays} absence days");
            }
            
            return _mapper.Map<AbsenceThresholdDto>(threshold);
        }

        public async Task<AbsenceThresholdDto> CreateAbsenceThresholdAsync(CreateAbsenceThresholdRequest request)
        {
            // Validate request
            var validationResult = await _createValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            // Create new threshold
            var threshold = _mapper.Map<Domain.Entities.AbsenceThreshold>(request);
            
            await _unitOfWork.AbsenceThresholds.AddAsync(threshold);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<AbsenceThresholdDto>(threshold);
        }

        public async Task<AbsenceThresholdDto> UpdateAbsenceThresholdAsync(int id, UpdateAbsenceThresholdRequest request)
        {
            // Set the ID for the validator to check for overlaps excluding the current entity
            _updateValidator.SetEntityId(id);
            
            // Validate request
            var validationResult = await _updateValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            // Get existing threshold
            var threshold = await _unitOfWork.AbsenceThresholds.GetByIdAsync(id);
            if (threshold == null)
            {
                throw new EntityNotFoundException("AbsenceThreshold", id);
            }

            // Update threshold
            threshold.Name = request.Name;
            threshold.MinAbsenceDays = request.MinAbsenceDays;
            threshold.MaxAbsenceDays = request.MaxAbsenceDays;
            threshold.AdjustmentPercentage = request.AdjustmentPercentage;
            threshold.Description = request.Description;
            threshold.IsActive = request.IsActive;
            
            _unitOfWork.AbsenceThresholds.Update(threshold);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<AbsenceThresholdDto>(threshold);
        }

        public async Task<bool> DeleteAbsenceThresholdAsync(int id)
        {
            // Get existing threshold
            var threshold = await _unitOfWork.AbsenceThresholds.GetByIdAsync(id);
            if (threshold == null)
            {
                throw new EntityNotFoundException("AbsenceThreshold", id);
            }

            // Soft delete by marking as inactive
            threshold.IsActive = false;
            _unitOfWork.AbsenceThresholds.Update(threshold);
            await _unitOfWork.CompleteAsync();

            return true;
        }

        public async Task<bool> CheckForOverlappingThresholdsAsync(int minDays, int? maxDays, int? excludeId = null)
        {
            return await _unitOfWork.AbsenceThresholds.CheckForOverlappingThresholdsAsync(minDays, maxDays, excludeId);
        }
    }
} 