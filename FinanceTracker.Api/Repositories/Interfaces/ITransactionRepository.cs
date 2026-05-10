using FinanceTracker.Api.Models;

namespace FinanceTracker.Api.Repositories.Interfaces;

/// <summary>
/// Data Access Object for handling Transaction entities.
/// </summary>
public interface ITransactionRepository
{
    Task<Transaction?> GetByIdAsync(Guid id);
    Task<IEnumerable<Transaction>> GetByUserIdAsync(Guid userId);
    Task<Transaction> AddAsync(Transaction transaction);
    Task UpdateAsync(Transaction transaction);
    Task DeleteAsync(Transaction transaction);
}
