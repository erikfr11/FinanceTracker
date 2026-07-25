using FinanceTracker.Api.Models;

namespace FinanceTracker.Api.DAOs.Interfaces;

public interface IFixedCostDao
{
    Task<FixedCost?> GetByIdAsync(Guid id);
    Task<IEnumerable<FixedCost>> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<FixedCost>> GetActiveAllAsync();
    Task<FixedCost> AddAsync(FixedCost fixedCost);
    Task UpdateAsync(FixedCost fixedCost);
    Task DeleteAsync(FixedCost fixedCost);
}
