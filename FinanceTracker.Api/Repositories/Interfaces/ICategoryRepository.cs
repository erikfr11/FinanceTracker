using FinanceTracker.Api.Models;

namespace FinanceTracker.Api.Repositories.Interfaces;

/// <summary>
/// Data Access Object for handling Category entities.
/// </summary>
public interface ICategoryRepository
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
