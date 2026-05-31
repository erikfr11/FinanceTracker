using FinanceTracker.Api.Models;
using FinanceTracker.Api.Repositories.Interfaces;
using FinanceTracker.Api.DAOs.Interfaces;

namespace FinanceTracker.Api.Repositories;

/// <summary>
/// Domain-level repository for Transaction.
/// It communicates exclusively with the data access layer (DAO) and is agnostic of EF Core.
/// </summary>
public class TransactionRepository : ITransactionRepository
{
    private readonly ITransactionDao _transactionDao;

    public TransactionRepository(ITransactionDao transactionDao)
    {
        _transactionDao = transactionDao;
    }

    public async Task<Transaction?> GetByIdAsync(Guid id)
    {
        return await _transactionDao.GetByIdAsync(id);
    }

    public async Task<IEnumerable<Transaction>> GetByUserIdAsync(Guid userId, DateTime? startDate = null, DateTime? endDate = null, int? categoryId = null, string? type = null)
    {
        return await _transactionDao.GetByUserIdAsync(userId, startDate, endDate, categoryId, type);
    }

    public async Task<Transaction> AddAsync(Transaction transaction)
    {
        return await _transactionDao.AddAsync(transaction);
    }

    public async Task AddRangeAsync(IEnumerable<Transaction> transactions)
    {
        await _transactionDao.AddRangeAsync(transactions);
    }

    public async Task UpdateAsync(Transaction transaction)
    {
        await _transactionDao.UpdateAsync(transaction);
    }

    public async Task DeleteAsync(Transaction transaction)
    {
        await _transactionDao.DeleteAsync(transaction);
    }

    public async Task DeleteRangeAsync(IEnumerable<Transaction> transactions)
    {
        await _transactionDao.DeleteRangeAsync(transactions);
    }
}
