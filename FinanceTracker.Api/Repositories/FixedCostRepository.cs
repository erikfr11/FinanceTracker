using FinanceTracker.Api.Models;
using FinanceTracker.Api.Repositories.Interfaces;
using FinanceTracker.Api.DAOs.Interfaces;

namespace FinanceTracker.Api.Repositories;

public class FixedCostRepository : IFixedCostRepository
{
    private readonly IFixedCostDao _fixedCostDao;

    public FixedCostRepository(IFixedCostDao fixedCostDao)
    {
        _fixedCostDao = fixedCostDao;
    }

    public async Task<FixedCost?> GetByIdAsync(Guid id)
    {
        return await _fixedCostDao.GetByIdAsync(id);
    }

    public async Task<IEnumerable<FixedCost>> GetByUserIdAsync(Guid userId)
    {
        return await _fixedCostDao.GetByUserIdAsync(userId);
    }

    public async Task<IEnumerable<FixedCost>> GetActiveAllAsync()
    {
        return await _fixedCostDao.GetActiveAllAsync();
    }

    public async Task<FixedCost> AddAsync(FixedCost fixedCost)
    {
        return await _fixedCostDao.AddAsync(fixedCost);
    }

    public async Task UpdateAsync(FixedCost fixedCost)
    {
        await _fixedCostDao.UpdateAsync(fixedCost);
    }

    public async Task DeleteAsync(FixedCost fixedCost)
    {
        await _fixedCostDao.DeleteAsync(fixedCost);
    }
}
