using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.Logging;
using PayrollServer.Application.DTOs.Employee;
using PayrollServer.Application.Features.Employee.Requests;
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
    public class EmployeeService : IEmployeeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IValidator<CreateEmployeeRequest> _createValidator;
        private readonly IValidator<UpdateEmployeeRequest> _updateValidator;
        private readonly ILogger<EmployeeService> _logger;

        public EmployeeService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IValidator<CreateEmployeeRequest> createValidator,
            IValidator<UpdateEmployeeRequest> updateValidator,
            ILogger<EmployeeService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
            _logger = logger;
        }

        public async Task<IEnumerable<EmployeeDto>> GetAllEmployeesAsync(int page = 1, int pageSize = 10, string searchTerm = null, int? departmentId = null, int? jobGradeId = null)
        {
            var employees = await _unitOfWork.Employees.GetEmployeesWithDetailsAsync(
                page, 
                pageSize, 
                searchTerm, 
                departmentId, 
                jobGradeId
            );
            
            return _mapper.Map<IEnumerable<EmployeeDto>>(employees);
        }

        public async Task<EmployeeDto> GetEmployeeByIdAsync(int id)
        {
            var employee = await _unitOfWork.Employees.GetEmployeeWithDetailsAsync(id);
            
            if (employee == null)
            {
                throw new EntityNotFoundException("Employee", id);
            }
            
            return _mapper.Map<EmployeeDto>(employee);
        }

        public async Task<EmployeeDto> GetEmployeeByEmployeeIdAsync(string employeeId)
        {
            var employee = await _unitOfWork.Employees.GetEmployeeByEmployeeNumberAsync(employeeId);
            
            if (employee == null)
            {
                throw new EntityNotFoundException("Employee", employeeId);
            }
            
            return _mapper.Map<EmployeeDto>(employee);
        }

        public async Task<EmployeeDto> CreateEmployeeAsync(CreateEmployeeRequest request)
        {
            // Validate request
            var validationResult = await _createValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            // Check department exists
            var department = await _unitOfWork.Departments.GetByIdAsync(request.DepartmentId);
            if (department == null)
            {
                throw new BusinessRuleViolationException("Invalid department", "The specified department does not exist");
            }

            // Check job grade exists
            var jobGrade = await _unitOfWork.JobGrades.GetByIdAsync(request.JobGradeId);
            if (jobGrade == null)
            {
                throw new BusinessRuleViolationException("Invalid job grade", "The specified job grade does not exist");
            }

            // Check for duplicate employee ID
            var existingEmployee = await _unitOfWork.Employees.GetEmployeeByEmployeeNumberAsync(request.EmployeeId);
            if (existingEmployee != null)
            {
                throw new BusinessRuleViolationException("Duplicate employee ID", "An employee with this ID already exists");
            }

            // Check for duplicate email
            var isDuplicateEmail = await _unitOfWork.Employees.IsDuplicateEmailAsync(request.Email);
            if (isDuplicateEmail)
            {
                throw new BusinessRuleViolationException("Duplicate email", "An employee with this email already exists");
            }

            // Create new employee
            var employee = _mapper.Map<Employee>(request);
            employee.Status = "Active"; // Default status for new employees
            
            await _unitOfWork.Employees.AddAsync(employee);
            await _unitOfWork.CompleteAsync();

            // If initial salary is provided, create a salary record
            if (request.InitialSalary.HasValue)
            {
                // Validate salary against job grade min/max
                if (request.InitialSalary < jobGrade.MinSalary || request.InitialSalary > jobGrade.MaxSalary)
                {
                    throw new BusinessRuleViolationException(
                        "Invalid salary", 
                        $"Salary must be between {jobGrade.MinSalary} and {jobGrade.MaxSalary} for the selected job grade"
                    );
                }

                var salaryRecord = new SalaryRecord
                {
                    EmployeeId = employee.Id,
                    BaseSalary = request.InitialSalary.Value,
                    EffectiveDate = DateTime.UtcNow,
                    Notes = "Initial salary"
                };

                await _unitOfWork.Repository<SalaryRecord>().AddAsync(salaryRecord);
                await _unitOfWork.CompleteAsync();
            }

            // Get the newly created employee with all details
            var newEmployee = await _unitOfWork.Employees.GetEmployeeWithDetailsAsync(employee.Id);
            return _mapper.Map<EmployeeDto>(newEmployee);
        }

        public async Task<EmployeeDto> UpdateEmployeeAsync(int id, UpdateEmployeeRequest request)
        {
            // Validate request
            var validationResult = await _updateValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            // Check employee exists
            var employee = await _unitOfWork.Employees.GetByIdAsync(id);
            if (employee == null)
            {
                throw new EntityNotFoundException("Employee", id);
            }

            // Check department exists
            var department = await _unitOfWork.Departments.GetByIdAsync(request.DepartmentId);
            if (department == null)
            {
                throw new BusinessRuleViolationException("Invalid department", "The specified department does not exist");
            }

            // Check job grade exists
            var jobGrade = await _unitOfWork.JobGrades.GetByIdAsync(request.JobGradeId);
            if (jobGrade == null)
            {
                throw new BusinessRuleViolationException("Invalid job grade", "The specified job grade does not exist");
            }

            // Check for duplicate email (if changing)
            if (employee.Email != request.Email)
            {
                var isDuplicateEmail = await _unitOfWork.Employees.IsDuplicateEmailAsync(request.Email, id);
                if (isDuplicateEmail)
                {
                    throw new BusinessRuleViolationException("Duplicate email", "An employee with this email already exists");
                }
            }

            // Update employee details
            employee.FirstName = request.FirstName;
            employee.LastName = request.LastName;
            employee.DateOfBirth = request.DateOfBirth;
            employee.Address = request.Address;
            employee.PhoneNumber = request.PhoneNumber;
            employee.Email = request.Email;
            employee.DepartmentId = request.DepartmentId;
            employee.JobGradeId = request.JobGradeId;
            employee.Status = request.EmploymentStatus;

            _unitOfWork.Employees.Update(employee);
            await _unitOfWork.CompleteAsync();

            // Get updated employee with all details
            var updatedEmployee = await _unitOfWork.Employees.GetEmployeeWithDetailsAsync(id);
            return _mapper.Map<EmployeeDto>(updatedEmployee);
        }

        public async Task<bool> DeleteEmployeeAsync(int id)
        {
            // Check employee exists
            var employee = await _unitOfWork.Employees.GetByIdAsync(id);
            if (employee == null)
            {
                throw new EntityNotFoundException("Employee", id);
            }

            // Soft delete
            employee.IsDeleted = true;
            
            _unitOfWork.Employees.Update(employee);
            await _unitOfWork.CompleteAsync();

            return true;
        }

        public async Task<bool> RestoreEmployeeAsync(int id)
        {
            // Get deleted employee
            var employee = await _unitOfWork.Employees.GetDeletedEmployeeByIdAsync(id);
            if (employee == null)
            {
                throw new EntityNotFoundException("Employee", id);
            }

            // Restore employee
            employee.IsDeleted = false;
            
            _unitOfWork.Employees.Update(employee);
            await _unitOfWork.CompleteAsync();

            return true;
        }

        public async Task<int> GetTotalEmployeesCountAsync(string searchTerm = null, int? departmentId = null, int? jobGradeId = null)
        {
            return await _unitOfWork.Employees.GetTotalCountAsync(searchTerm, departmentId, jobGradeId);
        }
    }
} 