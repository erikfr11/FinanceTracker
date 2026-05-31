using FinanceTracker.Api.Models;

namespace FinanceTracker.Api.DAOs.Interfaces;

/// <summary>
/// Data Access Object interface exclusively for interacting with the database
/// regarding Transaction entities. No complex domain logic.
/// </summary>
public interface ITransactionDao
{
    Task<Transaction?> GetByIdAsync(Guid id);
    Task<IEnumerable<Transaction>> GetByUserIdAsync(Guid userId, DateTime? startDate = null, DateTime? endDate = null, int? categoryId = null, string? type = null);
    Task<Transaction> AddAsync(Transaction transaction);
    Task AddRangeAsync(IEnumerable<Transaction> transactions);
    Task UpdateAsync(Transaction transaction);
    Task DeleteAsync(Transaction transaction);
    Task DeleteRangeAsync(IEnumerable<Transaction> transactions);
}
