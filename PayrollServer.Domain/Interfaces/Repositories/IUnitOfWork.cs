using System;
using System.Threading.Tasks;

namespace PayrollServer.Domain.Interfaces.Repositories
{
    public interface IUnitOfWork : IDisposable
    {
        IRepository<TEntity> Repository<TEntity>() where TEntity : Entities.BaseEntity;
        int Complete();
        Task<int> CompleteAsync();
    }
} 