using FinanceTracker.Api.Models;

namespace FinanceTracker.Api.DAOs.Interfaces;

/// <summary>
/// Data Access Object interface exclusively for interacting with the database
/// regarding Category entities. No complex domain logic.
/// </summary>
public interface ICategoryDao
{
    Task<Category?> GetByIdAsync(int id);
    Task<IEnumerable<Category>> GetAllAsync();
    Task<Category> AddAsync(Category category);
    Task UpdateAsync(Category category);
    Task DeleteAsync(Category category);
}
