using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.Logging;
using PayrollServer.Application.DTOs.AbsenceRecord;
using PayrollServer.Application.Features.AbsenceRecord.Requests;
using PayrollServer.Application.Interfaces.Services;
using PayrollServer.Domain.Exceptions;
using PayrollServer.Domain.Interfaces.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Application.Services
{
    public class AbsenceRecordService : IAbsenceRecordService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IValidator<CreateAbsenceRecordRequest> _createValidator;
        private readonly IValidator<UpdateAbsenceRecordRequest> _updateValidator;
        private readonly ILogger<AbsenceRecordService> _logger;

        public AbsenceRecordService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IValidator<CreateAbsenceRecordRequest> createValidator,
            IValidator<UpdateAbsenceRecordRequest> updateValidator,
            ILogger<AbsenceRecordService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
            _logger = logger;
        }

        public async Task<IEnumerable<AbsenceRecordDto>> GetAllAbsenceRecordsAsync(int year, int month)
        {
            var absenceRecords = await _unitOfWork.AbsenceRecords.GetAbsenceRecordsByYearMonthAsync(year, month);
            return _mapper.Map<IEnumerable<AbsenceRecordDto>>(absenceRecords);
        }

        public async Task<IEnumerable<AbsenceRecordDto>> GetAbsenceRecordsForEmployeeAsync(int employeeId)
        {
            var absenceRecords = await _unitOfWork.AbsenceRecords.GetAbsenceRecordsForEmployeeAsync(employeeId);
            return _mapper.Map<IEnumerable<AbsenceRecordDto>>(absenceRecords);
        }

        public async Task<AbsenceRecordDto> GetAbsenceRecordByIdAsync(int id)
        {
            var absenceRecord = await _unitOfWork.AbsenceRecords.GetByIdAsync(id);
            
            if (absenceRecord == null)
            {
                throw new EntityNotFoundException("AbsenceRecord", id);
            }
            
            return _mapper.Map<AbsenceRecordDto>(absenceRecord);
        }

        public async Task<AbsenceRecordDto> GetAbsenceRecordForMonthAsync(int employeeId, int year, int month)
        {
            var absenceRecord = await _unitOfWork.AbsenceRecords.GetAbsenceRecordForMonthAsync(employeeId, year, month);
            
            if (absenceRecord == null)
            {
                throw new EntityNotFoundException("AbsenceRecord", $"for employee {employeeId} in {month}/{year}");
            }
            
            return _mapper.Map<AbsenceRecordDto>(absenceRecord);
        }

        public async Task<AbsenceRecordDto> CreateAbsenceRecordAsync(CreateAbsenceRecordRequest request)
        {
            // Validate request
            var validationResult = await _createValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            // Get the appropriate absence threshold for the absence days
            var threshold = await _unitOfWork.AbsenceThresholds.GetThresholdForAbsenceDaysAsync(request.AbsenceDays);
            
            // Create new absence record
            var absenceRecord = _mapper.Map<Domain.Entities.AbsenceRecord>(request);
            
            // Apply adjustment percentage if a threshold was found
            if (threshold != null)
            {
                absenceRecord.AdjustmentPercentage = threshold.AdjustmentPercentage;
            }
            
            await _unitOfWork.AbsenceRecords.AddAsync(absenceRecord);
            await _unitOfWork.CompleteAsync();

            // Fetch the newly created record with employee details
            var createdRecord = await _unitOfWork.AbsenceRecords.GetByIdAsync(absenceRecord.Id);
            return _mapper.Map<AbsenceRecordDto>(createdRecord);
        }

        public async Task<AbsenceRecordDto> UpdateAbsenceRecordAsync(int id, UpdateAbsenceRecordRequest request)
        {
            // Validate request
            var validationResult = await _updateValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            // Get existing absence record
            var absenceRecord = await _unitOfWork.AbsenceRecords.GetByIdAsync(id);
            if (absenceRecord == null)
            {
                throw new EntityNotFoundException("AbsenceRecord", id);
            }

            // Get the appropriate absence threshold for the new absence days
            var threshold = await _unitOfWork.AbsenceThresholds.GetThresholdForAbsenceDaysAsync(request.AbsenceDays);

            // Update absence record
            absenceRecord.AbsenceDays = request.AbsenceDays;
            
            // Apply adjustment percentage if a threshold was found
            if (threshold != null)
            {
                absenceRecord.AdjustmentPercentage = threshold.AdjustmentPercentage;
            }
            else
            {
                absenceRecord.AdjustmentPercentage = null;
            }
            
            _unitOfWork.AbsenceRecords.Update(absenceRecord);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<AbsenceRecordDto>(absenceRecord);
        }

        public async Task<bool> DeleteAbsenceRecordAsync(int id)
        {
            // Get existing absence record
            var absenceRecord = await _unitOfWork.AbsenceRecords.GetByIdAsync(id);
            if (absenceRecord == null)
            {
                throw new EntityNotFoundException("AbsenceRecord", id);
            }

            // Delete absence record
            _unitOfWork.AbsenceRecords.Remove(absenceRecord);
            await _unitOfWork.CompleteAsync();

            return true;
        }
    }
} 