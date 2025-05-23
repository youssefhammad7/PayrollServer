using System;

namespace PayrollServer.Domain.Exceptions
{
    public class EntityNotFoundException : DomainException
    {
        public EntityNotFoundException(string entityName, object id)
            : base($"Entity \"{entityName}\" with ID {id} was not found.")
        {
            EntityName = entityName;
            Id = id;
        }

        public string EntityName { get; }
        public object Id { get; }
    }
} 