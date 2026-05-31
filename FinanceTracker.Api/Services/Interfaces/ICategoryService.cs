using FinanceTracker.Api.Models.DTOs;

namespace FinanceTracker.Api.Services.Interfaces;

public interface ICategoryService
{
    Task<IEnumerable<CategoryResponseDto>> GetVisibleCategoriesAsync(Guid userId);
    Task<CategoryResponseDto?> GetByIdAsync(int id, Guid userId);

    Task<CategoryResponseDto> AddAsync(Guid userId, bool isAdmin, CategoryCreateDto dto);
    Task<IEnumerable<CategoryResponseDto>> AddBulkAsync(Guid userId, bool isAdmin, IEnumerable<CategoryCreateDto> dtos);

    Task UpdateAsync(Guid userId, bool isAdmin, CategoryUpdateDto dto);

    Task DeleteAsync(int id, Guid userId, bool isAdmin);
    Task DeleteBulkAsync(IEnumerable<int> ids, Guid userId, bool isAdmin);
}
