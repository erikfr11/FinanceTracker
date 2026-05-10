using FinanceTracker.Api.Models;

namespace FinanceTracker.Api.Repositories.Interfaces;

/// <summary>
/// Data Access Object for handling Category entities.
/// </summary>
public interface ICategoryRepository
{
    Task<Category?> GetByIdAsync(int id);
    Task<IEnumerable<Category>> GetAllAsync(bool includeSystemCategories = true);
    Task<Category> AddAsync(Category category);
    Task UpdateAsync(Category category);
    Task DeleteAsync(Category category);
}
