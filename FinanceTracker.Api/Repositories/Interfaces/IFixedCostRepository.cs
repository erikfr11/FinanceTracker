using FinanceTracker.Api.Models;

namespace FinanceTracker.Api.Repositories.Interfaces;

public interface IFixedCostRepository
{
    Task<FixedCost?> GetByIdAsync(Guid id);
    Task<IEnumerable<FixedCost>> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<FixedCost>> GetActiveAllAsync();
    Task<FixedCost> AddAsync(FixedCost fixedCost);
    Task UpdateAsync(FixedCost fixedCost);
    Task DeleteAsync(FixedCost fixedCost);
}
