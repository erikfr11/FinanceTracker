using FinanceTracker.Api.Models;

namespace FinanceTracker.Api.Repositories.Interfaces;

/// <summary>
/// Data Access Object for handling Transaction entities.
/// </summary>
public interface ITransactionRepository
{
    Task<Transaction?> GetByIdAsync(Guid id);
    Task<IEnumerable<Transaction>> GetByUserIdAsync(Guid userId, DateTime? startDate = null, DateTime? endDate = null, int? categoryId = null, string? type = null);
    Task<Transaction> AddAsync(Transaction transaction);
    Task AddRangeAsync(IEnumerable<Transaction> transactions);
    Task UpdateAsync(Transaction transaction);
    Task DeleteAsync(Transaction transaction);
    Task DeleteRangeAsync(IEnumerable<Transaction> transactions);
}
