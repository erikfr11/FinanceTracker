using FinanceTracker.Api.Models;
using FinanceTracker.Api.Models.DTOs;
using FinanceTracker.Api.Models.Enums;
using FinanceTracker.Api.Models.Interfaces;
using FinanceTracker.Api.Repositories.Interfaces;
using FinanceTracker.Api.Services.Interfaces;

namespace FinanceTracker.Api.Services;

public class FixedCostService : IFixedCostService
{
    private readonly IFixedCostRepository _repository;
    private readonly ITransactionRepository _transactionRepository;
    private readonly IFinanceModelFactory _modelFactory;

    public FixedCostService(
        FinanceTracker.Api.Repositories.Factories.IRepositoryFactory repositoryFactory,
        IFinanceModelFactory modelFactory)
    {
        _repository = repositoryFactory.GetFixedCostRepository();
        _transactionRepository = repositoryFactory.GetTransactionRepository();
        _modelFactory = modelFactory;
    }

    public async Task<FixedCostResponseDto?> GetByIdAsync(Guid id, Guid userId)
    {
        var fixedCost = await _repository.GetByIdAsync(id);
        if (fixedCost == null || fixedCost.UserId != userId) return null;

        return MapToResponse(fixedCost);
    }

    public async Task<IEnumerable<FixedCostResponseDto>> GetByUserIdAsync(Guid userId)
    {
        var items = await _repository.GetByUserIdAsync(userId);
        return items.Select(MapToResponse);
    }

    public async Task<FixedCostResponseDto> AddAsync(Guid userId, FixedCostCreateDto dto)
    {
        var fixedCost = new FixedCost
        {
            Id = Guid.NewGuid(),
            Amount = dto.Amount,
            DueDayOfMonth = Math.Clamp(dto.DueDayOfMonth, 1, 31),
            Frequency = dto.Frequency,
            Note = dto.Note?.Trim() ?? string.Empty,
            IsActive = dto.IsActive,
            CategoryId = dto.CategoryId,
            UserId = userId,
            CreatedAtUtc = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(fixedCost);
        var loaded = await _repository.GetByIdAsync(created.Id);
        return MapToResponse(loaded ?? created);
    }

    public async Task UpdateAsync(Guid userId, FixedCostUpdateDto dto)
    {
        var fixedCost = await _repository.GetByIdAsync(dto.Id);
        if (fixedCost == null || fixedCost.UserId != userId)
            throw new UnauthorizedAccessException("Fixed cost rule not found or access denied.");

        fixedCost.Amount = dto.Amount;
        fixedCost.DueDayOfMonth = Math.Clamp(dto.DueDayOfMonth, 1, 31);
        fixedCost.Frequency = dto.Frequency;
        fixedCost.Note = dto.Note?.Trim() ?? string.Empty;
        fixedCost.IsActive = dto.IsActive;
        fixedCost.CategoryId = dto.CategoryId;

        await _repository.UpdateAsync(fixedCost);
    }

    public async Task DeleteAsync(Guid id, Guid userId)
    {
        var fixedCost = await _repository.GetByIdAsync(id);
        if (fixedCost == null || fixedCost.UserId != userId)
            throw new UnauthorizedAccessException("Fixed cost rule not found or access denied.");

        await _repository.DeleteAsync(fixedCost);
    }

    public async Task<int> ProcessDueFixedCostsAsync()
    {
        var activeItems = await _repository.GetActiveAllAsync();
        var today = DateTime.UtcNow;
        int generatedCount = 0;

        foreach (var fc in activeItems)
        {
            string currentKey;
            bool isDue;

            switch (fc.Frequency)
            {
                case FixedCostFrequency.Weekly:
                    var calendar = System.Globalization.CultureInfo.InvariantCulture.Calendar;
                    var weekNum = calendar.GetWeekOfYear(today, System.Globalization.CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday);
                    currentKey = $"W-{today.Year}-{weekNum:D2}";
                    isDue = true;
                    break;

                case FixedCostFrequency.Quarterly:
                    var quarter = (today.Month - 1) / 3 + 1;
                    currentKey = $"Q-{today.Year}-Q{quarter}";
                    isDue = today.Day >= fc.DueDayOfMonth;
                    break;

                case FixedCostFrequency.SemiAnnually:
                    var halfYear = (today.Month - 1) / 6 + 1;
                    currentKey = $"H-{today.Year}-H{halfYear}";
                    isDue = today.Day >= fc.DueDayOfMonth;
                    break;

                case FixedCostFrequency.Yearly:
                    currentKey = $"Y-{today.Year}";
                    isDue = today.Day >= fc.DueDayOfMonth;
                    break;

                case FixedCostFrequency.Monthly:
                default:
                    currentKey = $"{today.Year}-{today.Month:D2}";
                    isDue = today.Day >= fc.DueDayOfMonth;
                    break;
            }

            if (isDue && fc.LastGeneratedYearMonth != currentKey)
            {
                var daysInMonth = DateTime.DaysInMonth(today.Year, today.Month);
                var dueDay = Math.Min(fc.DueDayOfMonth, daysInMonth);
                var txDate = new DateTime(today.Year, today.Month, dueDay, 0, 0, 0, DateTimeKind.Utc);

                var noteText = string.IsNullOrWhiteSpace(fc.Note) ? "Fixkosten" : fc.Note;
                var transaction = _modelFactory.CreateTransaction(fc.Amount, txDate, fc.CategoryId, fc.UserId, noteText);

                await _transactionRepository.AddAsync(transaction);

                fc.LastGeneratedYearMonth = currentKey;
                await _repository.UpdateAsync(fc);

                generatedCount++;
            }
        }

        return generatedCount;
    }

    private static FixedCostResponseDto MapToResponse(FixedCost f)
    {
        return new FixedCostResponseDto
        {
            Id = f.Id,
            Amount = f.Amount,
            DueDayOfMonth = f.DueDayOfMonth,
            Frequency = f.Frequency.ToString(),
            Note = f.Note ?? string.Empty,
            IsActive = f.IsActive,
            CategoryId = f.CategoryId,
            CategoryName = f.Category?.Name ?? string.Empty,
            CategoryType = f.Category != null ? f.Category.Type.ToString() : string.Empty,
            CategoryExpenseType = f.Category != null ? f.Category.ExpenseType.ToString() : string.Empty,
            LastGeneratedYearMonth = f.LastGeneratedYearMonth,
            CreatedAtUtc = f.CreatedAtUtc
        };
    }
}
