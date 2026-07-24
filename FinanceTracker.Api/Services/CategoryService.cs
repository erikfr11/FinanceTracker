using FinanceTracker.Api.Models;
using FinanceTracker.Api.Models.DTOs;
using FinanceTracker.Api.Models.Interfaces;
using FinanceTracker.Api.Repositories.Interfaces;
using FinanceTracker.Api.Services.Interfaces;

namespace FinanceTracker.Api.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repository;
    private readonly ITransactionRepository _transactionRepository;
    private readonly IFinanceModelFactory _modelFactory;

    public CategoryService(
        FinanceTracker.Api.Repositories.Factories.IRepositoryFactory repositoryFactory,
        IFinanceModelFactory modelFactory)
    {
        _repository = repositoryFactory.GetCategoryRepository();
        _transactionRepository = repositoryFactory.GetTransactionRepository();
        _modelFactory = modelFactory;
    }

    public async Task<IEnumerable<CategoryResponseDto>> GetVisibleCategoriesAsync(Guid userId)
    {
        var categories = await _repository.GetVisibleAsync(userId);
        return categories.Select(c => MapToResponse(c, userId));
    }

    public async Task<CategoryResponseDto?> GetByIdAsync(int id, Guid userId)
    {
        var category = await _repository.GetByIdAsync(id);
        if (category == null) return null;

        if (category.IsSystemCategory || category.UserId == userId)
            return MapToResponse(category, userId);

        return null;
    }

    public async Task<CategoryResponseDto> AddAsync(Guid userId, bool isAdmin, CategoryCreateDto dto)
    {
        bool isSystem = isAdmin && dto.IsSystemCategory;
        Guid? ownerId = isSystem ? null : userId;

        var category = _modelFactory.CreateCategory(dto.Name, dto.Type, dto.ExpenseType, isSystem, ownerId);
        var created = await _repository.AddAsync(category);
        return MapToResponse(created, userId);
    }

    public async Task<IEnumerable<CategoryResponseDto>> AddBulkAsync(Guid userId, bool isAdmin, IEnumerable<CategoryCreateDto> dtos)
    {
        var categories = dtos.Select(dto => 
        {
            bool isSystem = isAdmin && dto.IsSystemCategory;
            Guid? ownerId = isSystem ? null : userId;
            return _modelFactory.CreateCategory(dto.Name, dto.Type, dto.ExpenseType, isSystem, ownerId);
        }).ToList();

        await _repository.AddRangeAsync(categories);
        return categories.Select(c => MapToResponse(c, userId));
    }

    public async Task UpdateAsync(Guid userId, bool isAdmin, CategoryUpdateDto dto)
    {
        var category = await _repository.GetByIdAsync(dto.Id);
        if (category == null) throw new KeyNotFoundException("Category not found.");

        AssertWriteAccess(category, userId, isAdmin);

        bool setSystem = isAdmin && dto.IsSystemCategory;

        category.Name = dto.Name;
        category.Type = dto.Type;
        category.ExpenseType = dto.ExpenseType;
        category.IsSystemCategory = setSystem;
        category.UserId = setSystem ? null : userId;

        await _repository.UpdateAsync(category);
    }

    public async Task DeleteAsync(int id, Guid userId, bool isAdmin)
    {
        var category = await _repository.GetByIdAsync(id);
        if (category == null) return;

        AssertWriteAccess(category, userId, isAdmin);

        if (category.IsSystemCategory && category.Name.Equals("Sonstiges", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Die Standard-Kategorie 'Sonstiges' kann nicht gelöscht werden.");
        }

        var visible = await _repository.GetVisibleAsync(userId);
        var defaultCategory = visible.FirstOrDefault(c => c.IsSystemCategory && c.Name.Equals("Sonstiges", StringComparison.OrdinalIgnoreCase))
            ?? visible.FirstOrDefault(c => c.IsSystemCategory);

        if (defaultCategory != null && defaultCategory.Id != category.Id)
        {
            await _transactionRepository.ReassignCategoryAsync(new[] { category.Id }, defaultCategory.Id);
        }

        await _repository.DeleteAsync(category);
    }

    public async Task DeleteBulkAsync(IEnumerable<int> ids, Guid userId, bool isAdmin)
    {
        var idList = ids.ToList();
        var categories = (await _repository.GetBulkAsync(idList)).ToList();
        
        foreach (var category in categories)
        {
            AssertWriteAccess(category, userId, isAdmin);
            if (category.IsSystemCategory && category.Name.Equals("Sonstiges", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Die Standard-Kategorie 'Sonstiges' kann nicht gelöscht werden.");
            }
        }

        if (categories.Any())
        {
            var visible = await _repository.GetVisibleAsync(userId);
            var defaultCategory = visible.FirstOrDefault(c => c.IsSystemCategory && c.Name.Equals("Sonstiges", StringComparison.OrdinalIgnoreCase))
                ?? visible.FirstOrDefault(c => c.IsSystemCategory);

            if (defaultCategory != null)
            {
                var toDeleteIds = categories.Select(c => c.Id).Where(cId => cId != defaultCategory.Id).ToList();
                if (toDeleteIds.Any())
                {
                    await _transactionRepository.ReassignCategoryAsync(toDeleteIds, defaultCategory.Id);
                }
            }

            await _repository.DeleteRangeAsync(categories);
        }
    }

    private static void AssertWriteAccess(Category category, Guid userId, bool isAdmin)
    {
        if (category.IsSystemCategory && !isAdmin)
            throw new UnauthorizedAccessException("Only admins can modify system categories.");

        if (!category.IsSystemCategory && category.UserId != userId)
            throw new UnauthorizedAccessException("Access denied. You do not own this category.");
    }

    private static CategoryResponseDto MapToResponse(Category c, Guid currentUserId)
    {
        return new CategoryResponseDto
        {
            Id = c.Id,
            Name = c.Name,
            Type = c.Type.ToString(),
            ExpenseType = c.ExpenseType.ToString(),
            IsSystemCategory = c.IsSystemCategory,
            IsOwnedByCurrentUser = c.UserId == currentUserId
        };
    }
}
