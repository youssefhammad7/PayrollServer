using System;
using System.Threading.Tasks;

namespace PayrollServer.Domain.Interfaces.Repositories
{
    public interface IUnitOfWork : IDisposable
    {
        // Generic repository accessor
        IRepository<TEntity> Repository<TEntity>() where TEntity : Entities.BaseEntity;
        
        // Specific repositories
        IDepartmentRepository Departments { get; }
        IJobGradeRepository JobGrades { get; }
        IEmployeeRepository Employees { get; }
        ISalaryRecordRepository SalaryRecords { get; }
        IIncentiveRepository Incentives { get; }
        IServiceBracketRepository ServiceBrackets { get; }
        IAbsenceRecordRepository AbsenceRecords { get; }
        IAbsenceThresholdRepository AbsenceThresholds { get; }
        IPayrollSnapshotRepository PayrollSnapshots { get; }
        
        // Save changes methods
        int Complete();
        Task<int> CompleteAsync();
    }
} 