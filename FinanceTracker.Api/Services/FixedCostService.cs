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
        var existingItems = await _repository.GetByUserIdAsync(userId);
        var trimmedNote = dto.Note?.Trim() ?? string.Empty;
        if (!string.IsNullOrWhiteSpace(trimmedNote) && existingItems.Any(f => string.Equals(f.Note?.Trim(), trimmedNote, StringComparison.OrdinalIgnoreCase)))
        {
            throw new ArgumentException($"Eine wiederkehrende Regel mit der Bezeichnung '{trimmedNote}' existiert bereits.");
        }

        var validStart = SanitizeStartDate(dto.StartDate, DateTime.UtcNow);

        var fixedCost = new FixedCost
        {
            Id = Guid.NewGuid(),
            Amount = dto.Amount,
            DueDayOfMonth = Math.Clamp(dto.DueDayOfMonth, 1, 31),
            Frequency = dto.Frequency,
            Note = trimmedNote,
            IsActive = dto.IsActive,
            CategoryId = dto.CategoryId,
            UserId = userId,
            StartDate = validStart,
            EndDate = dto.EndDate?.Date,
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

        var existingItems = await _repository.GetByUserIdAsync(userId);
        var trimmedNote = dto.Note?.Trim() ?? string.Empty;
        if (!string.IsNullOrWhiteSpace(trimmedNote) && existingItems.Any(f => f.Id != dto.Id && string.Equals(f.Note?.Trim(), trimmedNote, StringComparison.OrdinalIgnoreCase)))
        {
            throw new ArgumentException($"Eine wiederkehrende Regel mit der Bezeichnung '{trimmedNote}' existiert bereits.");
        }

        var validStart = SanitizeStartDate(dto.StartDate, fixedCost.CreatedAtUtc);

        fixedCost.Amount = dto.Amount;
        fixedCost.DueDayOfMonth = Math.Clamp(dto.DueDayOfMonth, 1, 31);
        fixedCost.Frequency = dto.Frequency;
        fixedCost.Note = trimmedNote;
        fixedCost.IsActive = dto.IsActive;
        fixedCost.CategoryId = dto.CategoryId;
        fixedCost.StartDate = validStart;
        fixedCost.EndDate = dto.EndDate?.Date;

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
            var validStart = SanitizeStartDate(fc.StartDate, fc.CreatedAtUtc);
            var txDate = new DateTime(today.Year, today.Month, Math.Min(fc.DueDayOfMonth, DateTime.DaysInMonth(today.Year, today.Month)), 0, 0, 0, DateTimeKind.Utc);

            // 1. Enforce StartDate and EndDate bounds
            if (txDate.Date < validStart.Date)
                continue;

            if (fc.EndDate.HasValue && txDate.Date > fc.EndDate.Value.Date)
                continue;

            // 2. Calculate months difference between candidate execution month and start date month
            var monthsDiff = (today.Year - validStart.Year) * 12 + (today.Month - validStart.Month);
            if (monthsDiff < 0)
                continue;

            string currentKey;
            bool isDue;
            var daysInMonth = DateTime.DaysInMonth(today.Year, today.Month);
            var targetDueDay = Math.Min(fc.DueDayOfMonth, daysInMonth);

            switch (fc.Frequency)
            {
                case FixedCostFrequency.Weekly:
                    var calendar = System.Globalization.CultureInfo.InvariantCulture.Calendar;
                    var weekNum = calendar.GetWeekOfYear(today, System.Globalization.CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday);
                    currentKey = $"{today.Year:D4}-W{weekNum:D2}";
                    isDue = today.Date >= validStart.Date;
                    break;

                case FixedCostFrequency.Quarterly:
                    currentKey = $"{today.Year:D4}-{today.Month:D2}";
                    isDue = (monthsDiff % 3 == 0) && (today.Day >= targetDueDay);
                    break;

                case FixedCostFrequency.SemiAnnually:
                    currentKey = $"{today.Year:D4}-{today.Month:D2}";
                    isDue = (monthsDiff % 6 == 0) && (today.Day >= targetDueDay);
                    break;

                case FixedCostFrequency.Yearly:
                    currentKey = $"{today.Year:D4}-{today.Month:D2}";
                    isDue = (monthsDiff % 12 == 0) && (today.Day >= targetDueDay);
                    break;

                case FixedCostFrequency.Monthly:
                default:
                    currentKey = $"{today.Year:D4}-{today.Month:D2}";
                    isDue = today.Day >= targetDueDay;
                    break;
            }

            if (isDue && fc.LastGeneratedYearMonth != currentKey)
            {
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

    private static DateTime SanitizeStartDate(DateTime dt, DateTime createdAtUtc)
    {
        if (dt != default && dt.Year >= 2000)
            return dt.Date;

        return createdAtUtc != default && createdAtUtc.Year >= 2000
            ? createdAtUtc.Date
            : new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
    }

    private static FixedCostResponseDto MapToResponse(FixedCost f)
    {
        var validStartDate = SanitizeStartDate(f.StartDate, f.CreatedAtUtc);

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
            StartDate = validStartDate,
            EndDate = f.EndDate,
            CreatedAtUtc = f.CreatedAtUtc
        };
    }
}
