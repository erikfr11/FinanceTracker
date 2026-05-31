using FinanceTracker.Api.Models;
using FinanceTracker.Api.Repositories.Interfaces;
using FinanceTracker.Api.DAOs.Interfaces;

namespace FinanceTracker.Api.Repositories;

/// <summary>
/// Domain-level repository for Category. 
/// It communicates exclusively with the data access layer (DAO) and is agnostic of EF Core or the actual database.
/// </summary>
public class CategoryRepository : ICategoryRepository
{
    private readonly ICategoryDao _categoryDao;

    public CategoryRepository(ICategoryDao categoryDao)
    {
        _categoryDao = categoryDao;
    }

    public async Task<Category?> GetByIdAsync(int id)
    {
        return await _categoryDao.GetByIdAsync(id);
    }

    public async Task<IEnumerable<Category>> GetVisibleAsync(Guid userId)
    {
        return await _categoryDao.GetVisibleAsync(userId);
    }

    public async Task<IEnumerable<Category>> GetBulkAsync(IEnumerable<int> ids)
    {
        return await _categoryDao.GetBulkAsync(ids);
    }

    public async Task<Category> AddAsync(Category category)
    {
        return await _categoryDao.AddAsync(category);
    }

    public async Task AddRangeAsync(IEnumerable<Category> categories)
    {
        await _categoryDao.AddRangeAsync(categories);
    }

    public async Task UpdateAsync(Category category)
    {
        await _categoryDao.UpdateAsync(category);
    }

    public async Task DeleteAsync(Category category)
    {
        await _categoryDao.DeleteAsync(category);
    }

    public async Task DeleteRangeAsync(IEnumerable<Category> categories)
    {
        await _categoryDao.DeleteRangeAsync(categories);
    }
}
