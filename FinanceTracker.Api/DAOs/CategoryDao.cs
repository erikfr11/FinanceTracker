using Microsoft.EntityFrameworkCore;
using FinanceTracker.Api.Data;
using FinanceTracker.Api.Models;
using FinanceTracker.Api.DAOs.Interfaces;

namespace FinanceTracker.Api.DAOs;

/// <summary>
/// Implementation of ICategoryDao using IDbContextFactory.
/// Operates statelessly to allow safely running as a Singleton.
/// </summary>
public class CategoryDao : ICategoryDao
{
    private readonly IDbContextFactory<AppDbContext> _contextFactory;

    public CategoryDao(IDbContextFactory<AppDbContext> contextFactory)
    {
        _contextFactory = contextFactory;
    }

    public async Task<Category?> GetByIdAsync(int id)
    {
        await using var context = await _contextFactory.CreateDbContextAsync();
        return await context.Categories.FindAsync(id);
    }

    public async Task<IEnumerable<Category>> GetVisibleAsync(Guid userId)
    {
        await using var context = await _contextFactory.CreateDbContextAsync();
        return await context.Categories
            .Where(c => c.IsSystemCategory || c.UserId == userId)
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<Category>> GetBulkAsync(IEnumerable<int> ids)
    {
        await using var context = await _contextFactory.CreateDbContextAsync();
        return await context.Categories
            .Where(c => ids.Contains(c.Id))
            .ToListAsync();
    }

    public async Task<Category> AddAsync(Category category)
    {
        await using var context = await _contextFactory.CreateDbContextAsync();
        context.Categories.Add(category);
        await context.SaveChangesAsync();
        return category;
    }

    public async Task AddRangeAsync(IEnumerable<Category> categories)
    {
        await using var context = await _contextFactory.CreateDbContextAsync();
        await context.Categories.AddRangeAsync(categories);
        await context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Category category)
    {
        await using var context = await _contextFactory.CreateDbContextAsync();
        context.Categories.Update(category);
        await context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Category category)
    {
        await using var context = await _contextFactory.CreateDbContextAsync();
        context.Categories.Remove(category);
        await context.SaveChangesAsync();
    }

    public async Task DeleteRangeAsync(IEnumerable<Category> categories)
    {
        await using var context = await _contextFactory.CreateDbContextAsync();
        context.Categories.RemoveRange(categories);
        await context.SaveChangesAsync();
    }
}
