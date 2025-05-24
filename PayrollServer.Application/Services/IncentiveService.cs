using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.Logging;
using PayrollServer.Application.DTOs.Incentive;
using PayrollServer.Application.Features.Incentive.Requests;
using PayrollServer.Application.Interfaces.Services;
using PayrollServer.Domain.Entities;
using PayrollServer.Domain.Exceptions;
using PayrollServer.Domain.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Application.Services
{
    public class IncentiveService : IIncentiveService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IValidator<CreateIncentiveRequest> _createValidator;
        private readonly IValidator<UpdateIncentiveRequest> _updateValidator;
        private readonly ILogger<IncentiveService> _logger;

        public IncentiveService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IValidator<CreateIncentiveRequest> createValidator,
            IValidator<UpdateIncentiveRequest> updateValidator,
            ILogger<IncentiveService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
            _logger = logger;
        }

        public async Task<IEnumerable<IncentiveDto>> GetAllIncentivesAsync(int? employeeId = null)
        {
            IEnumerable<Incentive> incentives;

            if (employeeId.HasValue)
            {
                incentives = await _unitOfWork.Incentives.GetIncentivesForEmployeeAsync(employeeId.Value);
            }
            else
            {
                incentives = await _unitOfWork.Incentives.GetAllAsync();
            }

            return _mapper.Map<IEnumerable<IncentiveDto>>(incentives);
        }

        public async Task<IncentiveDto> GetIncentiveByIdAsync(int id)
        {
            var incentive = await _unitOfWork.Incentives.GetByIdAsync(id);
            
            if (incentive == null)
            {
                throw new EntityNotFoundException("Incentive", id);
            }
            
            return _mapper.Map<IncentiveDto>(incentive);
        }

        public async Task<IEnumerable<IncentiveDto>> GetIncentivesForEmployeeAsync(int employeeId)
        {
            // Verify employee exists
            var employee = await _unitOfWork.Employees.GetByIdAsync(employeeId);
            if (employee == null)
            {
                throw new EntityNotFoundException("Employee", employeeId);
            }

            var incentives = await _unitOfWork.Incentives.GetIncentivesForEmployeeAsync(employeeId);
            return _mapper.Map<IEnumerable<IncentiveDto>>(incentives);
        }

        public async Task<IEnumerable<IncentiveDto>> GetIncentivesByDateRangeAsync(DateTime startDate, DateTime endDate, int? employeeId = null)
        {
            // Validate date range
            if (startDate > endDate)
            {
                throw new BusinessRuleViolationException("Invalid date range", "Start date must be before or equal to end date");
            }

            // Verify employee exists if ID is provided
            if (employeeId.HasValue)
            {
                var employee = await _unitOfWork.Employees.GetByIdAsync(employeeId.Value);
                if (employee == null)
                {
                    throw new EntityNotFoundException("Employee", employeeId.Value);
                }
            }

            var incentives = await _unitOfWork.Incentives.GetIncentivesByDateRangeAsync(startDate, endDate, employeeId);
            return _mapper.Map<IEnumerable<IncentiveDto>>(incentives);
        }

        public async Task<IncentiveDto> CreateIncentiveAsync(CreateIncentiveRequest request)
        {
            // Validate request
            var validationResult = await _createValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            // Verify employee exists
            var employee = await _unitOfWork.Employees.GetByIdAsync(request.EmployeeId);
            if (employee == null)
            {
                throw new EntityNotFoundException("Employee", request.EmployeeId);
            }

            // Create new incentive
            var incentive = new Incentive
            {
                EmployeeId = request.EmployeeId,
                Title = request.Title,
                Description = request.Description,
                Amount = request.Amount,
                Date = request.Date,
                Type = request.Type,
                IsTaxable = request.IsTaxable
            };
            
            await _unitOfWork.Incentives.AddAsync(incentive);
            await _unitOfWork.CompleteAsync();

            // Populate DTO with employee details
            var incentiveDto = _mapper.Map<IncentiveDto>(incentive);
            incentiveDto.EmployeeName = $"{employee.FirstName} {employee.LastName}";
            incentiveDto.EmployeeNumber = employee.EmployeeId;

            return incentiveDto;
        }

        public async Task<IncentiveDto> UpdateIncentiveAsync(int id, UpdateIncentiveRequest request)
        {
            // Validate request
            var validationResult = await _updateValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            // Get existing incentive
            var incentive = await _unitOfWork.Incentives.GetByIdAsync(id);
            if (incentive == null)
            {
                throw new EntityNotFoundException("Incentive", id);
            }

            // Update incentive
            incentive.Title = request.Title;
            incentive.Description = request.Description;
            incentive.Amount = request.Amount;
            incentive.Date = request.Date;
            incentive.Type = request.Type;
            incentive.IsTaxable = request.IsTaxable;
            
            _unitOfWork.Incentives.Update(incentive);
            await _unitOfWork.CompleteAsync();

            // Get employee details for the DTO
            var employee = await _unitOfWork.Employees.GetByIdAsync(incentive.EmployeeId);

            // Populate DTO with employee details
            var incentiveDto = _mapper.Map<IncentiveDto>(incentive);
            incentiveDto.EmployeeName = $"{employee.FirstName} {employee.LastName}";
            incentiveDto.EmployeeNumber = employee.EmployeeId;

            return incentiveDto;
        }

        public async Task<bool> DeleteIncentiveAsync(int id)
        {
            // Get existing incentive
            var incentive = await _unitOfWork.Incentives.GetByIdAsync(id);
            if (incentive == null)
            {
                throw new EntityNotFoundException("Incentive", id);
            }

            // Delete incentive
            _unitOfWork.Incentives.Remove(incentive);
            await _unitOfWork.CompleteAsync();

            return true;
        }
    }
} 