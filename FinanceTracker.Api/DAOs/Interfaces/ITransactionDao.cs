using FinanceTracker.Api.Models;

namespace FinanceTracker.Api.DAOs.Interfaces;

/// <summary>
/// Data Access Object interface exclusively for interacting with the database
/// regarding Transaction entities. No complex domain logic.
/// </summary>
public interface ITransactionDao
{
    Task<Transaction?> GetByIdAsync(Guid id);
    Task<IEnumerable<Transaction>> GetByUserIdAsync(Guid userId);
    Task<Transaction> AddAsync(Transaction transaction);
    Task UpdateAsync(Transaction transaction);
    Task DeleteAsync(Transaction transaction);
}
