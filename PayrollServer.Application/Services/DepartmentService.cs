using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.Logging;
using PayrollServer.Application.DTOs.Department;
using PayrollServer.Application.Features.Department.Requests;
using PayrollServer.Application.Interfaces.Services;
using PayrollServer.Domain.Entities;
using PayrollServer.Domain.Exceptions;
using PayrollServer.Domain.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PayrollServer.Application.Services
{
    public class DepartmentService : IDepartmentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IValidator<CreateDepartmentRequest> _createValidator;
        private readonly IValidator<UpdateDepartmentRequest> _updateValidator;
        private readonly IValidator<UpdateDepartmentIncentiveRequest> _incentiveValidator;
        private readonly ILogger<DepartmentService> _logger;

        public DepartmentService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IValidator<CreateDepartmentRequest> createValidator,
            IValidator<UpdateDepartmentRequest> updateValidator,
            IValidator<UpdateDepartmentIncentiveRequest> incentiveValidator,
            ILogger<DepartmentService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
            _incentiveValidator = incentiveValidator;
            _logger = logger;
        }

        public async Task<IEnumerable<DepartmentDto>> GetAllDepartmentsAsync()
        {
            var departments = await _unitOfWork.Departments.GetAllAsync();
            return _mapper.Map<IEnumerable<DepartmentDto>>(departments);
        }

        public async Task<DepartmentDto> GetDepartmentByIdAsync(int id)
        {
            var department = await _unitOfWork.Departments.GetByIdAsync(id);
            return _mapper.Map<DepartmentDto>(department);
        }

        public async Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentRequest request)
        {
            // Validate request
            var validationResult = await _createValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errorMessage = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage));
                throw new ValidationException(validationResult.Errors);
            }

            // Check for duplicate name
            var isDuplicate = await _unitOfWork.Departments.IsDuplicateNameAsync(request.Name);
            if (isDuplicate)
            {
                throw new BusinessRuleViolationException("Duplicate department name is not allowed", "Department with this name already exists");
            }

            // Create new department
            var department = _mapper.Map<Department>(request);
            
            // Set incentive date if incentive percentage is provided
            if (request.IncentivePercentage.HasValue)
            {
                department.IncentiveSetDate = DateTime.UtcNow;
            }

            await _unitOfWork.Departments.AddAsync(department);
            await _unitOfWork.CompleteAsync();

            // If incentive is set, create a history record
            if (request.IncentivePercentage.HasValue)
            {
                var incentiveHistory = new DepartmentIncentiveHistory
                {
                    DepartmentId = department.Id,
                    IncentivePercentage = request.IncentivePercentage.Value,
                    EffectiveDate = DateTime.UtcNow
                };

                await _unitOfWork.Repository<DepartmentIncentiveHistory>().AddAsync(incentiveHistory);
                await _unitOfWork.CompleteAsync();
            }

            return _mapper.Map<DepartmentDto>(department);
        }

        public async Task<DepartmentDto> UpdateDepartmentAsync(int id, UpdateDepartmentRequest request)
        {
            // Validate request
            var validationResult = await _updateValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            // Check if department exists
            var department = await _unitOfWork.Departments.GetByIdAsync(id);

            // Check for duplicate name
            var isDuplicate = await _unitOfWork.Departments.IsDuplicateNameAsync(request.Name, id);
            if (isDuplicate)
            {
                throw new BusinessRuleViolationException("Duplicate department name is not allowed", "Department with this name already exists");
            }

            // Update department
            department.Name = request.Name;
            
            _unitOfWork.Departments.Update(department);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<DepartmentDto>(department);
        }

        public async Task<bool> DeleteDepartmentAsync(int id)
        {
            // Check if department exists
            var department = await _unitOfWork.Departments.GetByIdAsync(id);

            // Check if department has employees
            var hasEmployees = await _unitOfWork.Departments.HasEmployeesAsync(id);
            if (hasEmployees)
            {
                throw new BusinessRuleViolationException("Deletion constraint violation", "Department has associated employees and cannot be deleted");
            }

            _unitOfWork.Departments.Remove(department);
            await _unitOfWork.CompleteAsync();

            return true;
        }

        public async Task<DepartmentDto> UpdateDepartmentIncentiveAsync(int id, UpdateDepartmentIncentiveRequest request)
        {
            // Validate request
            var validationResult = await _incentiveValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            // Check if department exists
            var department = await _unitOfWork.Departments.GetByIdAsync(id);

            // Update department incentive
            department.IncentivePercentage = request.IncentivePercentage;
            department.IncentiveSetDate = DateTime.UtcNow;
            
            _unitOfWork.Departments.Update(department);

            // Create incentive history record
            var incentiveHistory = new DepartmentIncentiveHistory
            {
                DepartmentId = id,
                IncentivePercentage = request.IncentivePercentage,
                EffectiveDate = DateTime.UtcNow
            };

            await _unitOfWork.Repository<DepartmentIncentiveHistory>().AddAsync(incentiveHistory);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<DepartmentDto>(department);
        }

        public async Task<IEnumerable<DepartmentIncentiveHistoryDto>> GetDepartmentIncentiveHistoryAsync(int departmentId)
        {
            // Check if department exists
            await _unitOfWork.Departments.GetByIdAsync(departmentId);

            // Get incentive history
            var history = await _unitOfWork.Departments.GetIncentiveHistoryAsync(departmentId);
            return _mapper.Map<IEnumerable<DepartmentIncentiveHistoryDto>>(history);
        }
    }
} 