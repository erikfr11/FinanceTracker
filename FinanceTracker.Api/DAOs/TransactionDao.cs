using Microsoft.EntityFrameworkCore;
using FinanceTracker.Api.Data;
using FinanceTracker.Api.Models;
using FinanceTracker.Api.DAOs.Interfaces;

namespace FinanceTracker.Api.DAOs;

/// <summary>
/// Implementation of ITransactionDao using IDbContextFactory.
/// Operates statelessly to allow safely running as a Singleton.
/// </summary>
public class TransactionDao : ITransactionDao
{
    private readonly IDbContextFactory<AppDbContext> _contextFactory;

    public TransactionDao(IDbContextFactory<AppDbContext> contextFactory)
    {
        _contextFactory = contextFactory;
    }

    public async Task<Transaction?> GetByIdAsync(Guid id)
    {
        await using var context = await _contextFactory.CreateDbContextAsync();
        return await context.Transactions
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<IEnumerable<Transaction>> GetByUserIdAsync(Guid userId)
    {
        await using var context = await _contextFactory.CreateDbContextAsync();
        return await context.Transactions
            .Include(t => t.Category)
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.Date)
            .ToListAsync();
    }

    public async Task<Transaction> AddAsync(Transaction transaction)
    {
        await using var context = await _contextFactory.CreateDbContextAsync();
        context.Transactions.Add(transaction);
        await context.SaveChangesAsync();
        return transaction;
    }

    public async Task UpdateAsync(Transaction transaction)
    {
        await using var context = await _contextFactory.CreateDbContextAsync();
        context.Transactions.Update(transaction);
        await context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Transaction transaction)
    {
        await using var context = await _contextFactory.CreateDbContextAsync();
        context.Transactions.Remove(transaction);
        await context.SaveChangesAsync();
    }
}
