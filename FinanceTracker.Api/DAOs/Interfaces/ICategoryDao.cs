using FinanceTracker.Api.Models;

namespace FinanceTracker.Api.DAOs.Interfaces;

/// <summary>
/// Data Access Object interface exclusively for interacting with the database
/// regarding Category entities. No complex domain logic.
/// </summary>
public interface ICategoryDao
{
    Task<Category?> GetByIdAsync(int id);
    Task<IEnumerable<Category>> GetVisibleAsync(Guid userId);
    Task<IEnumerable<Category>> GetBulkAsync(IEnumerable<int> ids);
    Task<Category> AddAsync(Category category);
    Task AddRangeAsync(IEnumerable<Category> categories);
    Task UpdateAsync(Category category);
    Task DeleteAsync(Category category);
    Task DeleteRangeAsync(IEnumerable<Category> categories);
}
