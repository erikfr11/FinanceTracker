using FinanceTracker.Api.Models.DTOs;

namespace FinanceTracker.Api.Services.Interfaces;

public interface IFixedCostService
{
    Task<FixedCostResponseDto?> GetByIdAsync(Guid id, Guid userId);
    Task<IEnumerable<FixedCostResponseDto>> GetByUserIdAsync(Guid userId);
    Task<FixedCostResponseDto> AddAsync(Guid userId, FixedCostCreateDto dto);
    Task UpdateAsync(Guid userId, FixedCostUpdateDto dto);
    Task DeleteAsync(Guid id, Guid userId);
    Task<int> ProcessDueFixedCostsAsync();
}
