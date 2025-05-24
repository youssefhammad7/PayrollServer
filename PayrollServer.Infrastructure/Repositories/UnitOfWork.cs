using PayrollServer.Domain.Entities;
using PayrollServer.Domain.Interfaces.Repositories;
using PayrollServer.Infrastructure.Data.Context;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private readonly Dictionary<Type, object> _repositories;
        private bool _disposed;

        // Specific repositories
        private readonly IDepartmentRepository _departmentsRepository;
        private readonly IJobGradeRepository _jobGradesRepository;
        private readonly IEmployeeRepository _employeesRepository;
        private readonly ISalaryRecordRepository _salaryRecordsRepository;
        private readonly IIncentiveRepository _incentivesRepository;
        private readonly IServiceBracketRepository _serviceBracketsRepository;
        private readonly IAbsenceRecordRepository _absenceRecordsRepository;
        private readonly IAbsenceThresholdRepository _absenceThresholdsRepository;
        private readonly IPayrollSnapshotRepository _payrollSnapshotsRepository;

        public UnitOfWork(
            ApplicationDbContext context,
            IDepartmentRepository departmentRepository,
            IJobGradeRepository jobGradeRepository,
            IEmployeeRepository employeeRepository,
            ISalaryRecordRepository salaryRecordRepository,
            IIncentiveRepository incentiveRepository,
            IServiceBracketRepository serviceBracketRepository,
            IAbsenceRecordRepository absenceRecordRepository,
            IAbsenceThresholdRepository absenceThresholdRepository,
            IPayrollSnapshotRepository payrollSnapshotRepository)
        {
            _context = context;
            _repositories = new Dictionary<Type, object>();
            _departmentsRepository = departmentRepository;
            _jobGradesRepository = jobGradeRepository;
            _employeesRepository = employeeRepository;
            _salaryRecordsRepository = salaryRecordRepository;
            _incentivesRepository = incentiveRepository;
            _serviceBracketsRepository = serviceBracketRepository;
            _absenceRecordsRepository = absenceRecordRepository;
            _absenceThresholdsRepository = absenceThresholdRepository;
            _payrollSnapshotsRepository = payrollSnapshotRepository;
        }

        public IDepartmentRepository Departments => _departmentsRepository;

        public IJobGradeRepository JobGrades => _jobGradesRepository;

        public IEmployeeRepository Employees => _employeesRepository;

        public ISalaryRecordRepository SalaryRecords => _salaryRecordsRepository;

        public IIncentiveRepository Incentives => _incentivesRepository;

        public IServiceBracketRepository ServiceBrackets => _serviceBracketsRepository;

        public IAbsenceRecordRepository AbsenceRecords => _absenceRecordsRepository;

        public IAbsenceThresholdRepository AbsenceThresholds => _absenceThresholdsRepository;

        public IPayrollSnapshotRepository PayrollSnapshots => _payrollSnapshotsRepository;

        public IRepository<TEntity> Repository<TEntity>() where TEntity : BaseEntity
        {
            var type = typeof(TEntity);

            if (!_repositories.ContainsKey(type))
            {
                var repositoryType = typeof(Repository<>);
                var repositoryInstance = Activator.CreateInstance(repositoryType.MakeGenericType(type), _context);
                if (repositoryInstance != null)
                {
                    _repositories.Add(type, repositoryInstance);
                }
            }

            return (IRepository<TEntity>)_repositories[type];
        }

        public int Complete()
        {
            return _context.SaveChanges();
        }

        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    _context.Dispose();
                }

                _disposed = true;
            }
        }
    }
}