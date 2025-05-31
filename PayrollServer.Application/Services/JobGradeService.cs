using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.Logging;
using PayrollServer.Application.DTOs.JobGrade;
using PayrollServer.Application.Features.JobGrade.Requests;
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
    public class JobGradeService : IJobGradeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IValidator<CreateJobGradeRequest> _createValidator;
        private readonly IValidator<UpdateJobGradeRequest> _updateValidator;
        private readonly ILogger<JobGradeService> _logger;

        public JobGradeService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IValidator<CreateJobGradeRequest> createValidator,
            IValidator<UpdateJobGradeRequest> updateValidator,
            ILogger<JobGradeService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
            _logger = logger;
        }

        public async Task<IEnumerable<JobGradeDto>> GetAllJobGradesAsync()
        {
            var jobGrades = await _unitOfWork.JobGrades.GetAllAsync();
            var jobGradeDtos = _mapper.Map<IEnumerable<JobGradeDto>>(jobGrades).ToList();
            
            // Manually calculate and set employee count for each job grade
            foreach (var jobGradeDto in jobGradeDtos)
            {
                var employeeCount = await _unitOfWork.Employees.GetEmployeeCountByJobGradeAsync(jobGradeDto.Id);
                jobGradeDto.EmployeeCount = employeeCount;
            }
            
            return jobGradeDtos;
        }

        public async Task<JobGradeDto> GetJobGradeByIdAsync(int id)
        {
            var jobGrade = await _unitOfWork.JobGrades.GetByIdAsync(id);
            var jobGradeDto = _mapper.Map<JobGradeDto>(jobGrade);
            
            // Manually calculate and set employee count
            var employeeCount = await _unitOfWork.Employees.GetEmployeeCountByJobGradeAsync(id);
            jobGradeDto.EmployeeCount = employeeCount;
            
            return jobGradeDto;
        }

        public async Task<JobGradeDto> CreateJobGradeAsync(CreateJobGradeRequest request)
        {
            // Validate request
            var validationResult = await _createValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            // Check for duplicate name
            var isDuplicate = await _unitOfWork.JobGrades.IsDuplicateNameAsync(request.Name);
            if (isDuplicate)
            {
                throw new BusinessRuleViolationException("Duplicate job grade name is not allowed", "Job grade with this name already exists");
            }

            // Create new job grade
            var jobGrade = _mapper.Map<JobGrade>(request);
            
            await _unitOfWork.JobGrades.AddAsync(jobGrade);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<JobGradeDto>(jobGrade);
        }

        public async Task<JobGradeDto> UpdateJobGradeAsync(int id, UpdateJobGradeRequest request)
        {
            // Validate request
            var validationResult = await _updateValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            // Check if job grade exists
            var jobGrade = await _unitOfWork.JobGrades.GetByIdAsync(id);

            // Check for duplicate name
            var isDuplicate = await _unitOfWork.JobGrades.IsDuplicateNameAsync(request.Name, id);
            if (isDuplicate)
            {
                throw new BusinessRuleViolationException("Duplicate job grade name is not allowed", "Job grade with this name already exists");
            }

            // Update job grade
            jobGrade.Name = request.Name;
            jobGrade.Description = request.Description;
            jobGrade.MinSalary = request.MinSalary;
            jobGrade.MaxSalary = request.MaxSalary;
            
            _unitOfWork.JobGrades.Update(jobGrade);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<JobGradeDto>(jobGrade);
        }

        public async Task<bool> DeleteJobGradeAsync(int id)
        {
            // Check if job grade exists
            var jobGrade = await _unitOfWork.JobGrades.GetByIdAsync(id);

            // Check if job grade has employees
            var hasEmployees = await _unitOfWork.JobGrades.HasEmployeesAsync(id);
            if (hasEmployees)
            {
                throw new BusinessRuleViolationException("Deletion constraint violation", "Job grade has associated employees and cannot be deleted");
            }

            _unitOfWork.JobGrades.Remove(jobGrade);
            await _unitOfWork.CompleteAsync();

            return true;
        }
    }
} 