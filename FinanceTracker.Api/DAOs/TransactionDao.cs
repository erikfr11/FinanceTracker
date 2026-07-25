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

    public async Task<IEnumerable<Transaction>> GetByUserIdAsync(Guid userId, DateTime? startDate = null, DateTime? endDate = null, int? categoryId = null, string? type = null, string? searchTerm = null, decimal? minAmount = null, decimal? maxAmount = null)
    {
        await using var context = await _contextFactory.CreateDbContextAsync();
        var query = context.Transactions
            .Include(t => t.Category)
            .Where(t => t.UserId == userId)
            .AsQueryable();

        if (startDate.HasValue)
        {
            var sDate = startDate.Value.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(startDate.Value, DateTimeKind.Utc)
                : startDate.Value.ToUniversalTime();
            query = query.Where(t => t.Date >= sDate);
        }
        
        if (endDate.HasValue)
        {
            var eDate = endDate.Value.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(endDate.Value, DateTimeKind.Utc)
                : endDate.Value.ToUniversalTime();
            query = query.Where(t => t.Date <= eDate);
        }

        if (categoryId.HasValue)
            query = query.Where(t => t.CategoryId == categoryId.Value);

        if (!string.IsNullOrEmpty(type) && Enum.TryParse<FinanceTracker.Api.Models.Enums.CategoryType>(type, true, out var parsedType))
            query = query.Where(t => t.Category.Type == parsedType);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.Trim().ToLower();
            query = query.Where(t => (t.Note != null && t.Note.ToLower().Contains(term)) || (t.Category != null && t.Category.Name.ToLower().Contains(term)));
        }

        if (minAmount.HasValue)
            query = query.Where(t => t.Amount >= minAmount.Value);

        if (maxAmount.HasValue)
            query = query.Where(t => t.Amount <= maxAmount.Value);

        return await query.OrderByDescending(t => t.Date).ToListAsync();
    }

    public async Task<Transaction> AddAsync(Transaction transaction)
    {
        if (transaction.Id == Guid.Empty)
        {
            transaction.Id = Guid.NewGuid();
        }

        await using var context = await _contextFactory.CreateDbContextAsync();
        context.Transactions.Add(transaction);
        try
        {
            await context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            throw new ArgumentException($"Fehler beim Speichern in der Datenbank: {ex.InnerException?.Message ?? ex.Message}", ex);
        }
        return transaction;
    }

    public async Task AddRangeAsync(IEnumerable<Transaction> transactions)
    {
        await using var context = await _contextFactory.CreateDbContextAsync();
        var list = transactions.ToList();
        foreach (var t in list)
        {
            if (t.Id == Guid.Empty)
            {
                t.Id = Guid.NewGuid();
            }
        }
        await context.Transactions.AddRangeAsync(list);
        await context.SaveChangesAsync();
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

    public async Task DeleteRangeAsync(IEnumerable<Transaction> transactions)
    {
        await using var context = await _contextFactory.CreateDbContextAsync();
        context.Transactions.RemoveRange(transactions);
        await context.SaveChangesAsync();
    }

    public async Task ReassignCategoryAsync(IEnumerable<int> oldCategoryIds, int newCategoryId)
    {
        await using var context = await _contextFactory.CreateDbContextAsync();
        var idList = oldCategoryIds.ToList();
        var txs = await context.Transactions
            .Where(t => idList.Contains(t.CategoryId))
            .ToListAsync();

        foreach (var t in txs)
        {
            t.CategoryId = newCategoryId;
        }

        await context.SaveChangesAsync();
    }
}
