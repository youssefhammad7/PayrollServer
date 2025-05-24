using PayrollServer.Domain.Entities;
using PayrollServer.Domain.Interfaces.Repositories;
using PayrollServer.Infrastructure.Data.Context;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Infrastructure.Data.Repositories
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

        public UnitOfWork(
            ApplicationDbContext context,
            IDepartmentRepository departmentRepository,
            IJobGradeRepository jobGradeRepository,
            IEmployeeRepository employeeRepository)
        {
            _context = context;
            _repositories = new Dictionary<Type, object>();
            _departmentsRepository = departmentRepository;
            _jobGradesRepository = jobGradeRepository;
            _employeesRepository = employeeRepository;
        }

        public IDepartmentRepository Departments => _departmentsRepository;
        
        public IJobGradeRepository JobGrades => _jobGradesRepository;
        
        public IEmployeeRepository Employees => _employeesRepository;

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