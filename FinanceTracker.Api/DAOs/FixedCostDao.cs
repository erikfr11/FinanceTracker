using Microsoft.EntityFrameworkCore;
using FinanceTracker.Api.Data;
using FinanceTracker.Api.Models;
using FinanceTracker.Api.DAOs.Interfaces;

namespace FinanceTracker.Api.DAOs;

public class FixedCostDao : IFixedCostDao
{
    private readonly IDbContextFactory<AppDbContext> _contextFactory;

    public FixedCostDao(IDbContextFactory<AppDbContext> contextFactory)
    {
        _contextFactory = contextFactory;
    }

    public async Task<FixedCost?> GetByIdAsync(Guid id)
    {
        await using var context = await _contextFactory.CreateDbContextAsync();
        return await context.FixedCosts
            .Include(f => f.Category)
            .FirstOrDefaultAsync(f => f.Id == id);
    }

    public async Task<IEnumerable<FixedCost>> GetByUserIdAsync(Guid userId)
    {
        await using var context = await _contextFactory.CreateDbContextAsync();
        return await context.FixedCosts
            .Include(f => f.Category)
            .Where(f => f.UserId == userId)
            .OrderBy(f => f.DueDayOfMonth)
            .ThenBy(f => f.Note)
            .ToListAsync();
    }

    public async Task<IEnumerable<FixedCost>> GetActiveAllAsync()
    {
        await using var context = await _contextFactory.CreateDbContextAsync();
        return await context.FixedCosts
            .Include(f => f.Category)
            .Where(f => f.IsActive)
            .ToListAsync();
    }

    public async Task<FixedCost> AddAsync(FixedCost fixedCost)
    {
        if (fixedCost.Id == Guid.Empty)
        {
            fixedCost.Id = Guid.NewGuid();
        }

        await using var context = await _contextFactory.CreateDbContextAsync();
        context.FixedCosts.Add(fixedCost);
        await context.SaveChangesAsync();
        return fixedCost;
    }

    public async Task UpdateAsync(FixedCost fixedCost)
    {
        await using var context = await _contextFactory.CreateDbContextAsync();
        context.FixedCosts.Update(fixedCost);
        await context.SaveChangesAsync();
    }

    public async Task DeleteAsync(FixedCost fixedCost)
    {
        await using var context = await _contextFactory.CreateDbContextAsync();
        context.FixedCosts.Remove(fixedCost);
        await context.SaveChangesAsync();
    }
}
