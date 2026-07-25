using FinanceTracker.Api.Models;
using FinanceTracker.Api.Models.DTOs;
using FinanceTracker.Api.Models.Interfaces;
using FinanceTracker.Api.Repositories.Interfaces;
using FinanceTracker.Api.Services.Interfaces;

namespace FinanceTracker.Api.Services;

public class TransactionService : ITransactionService
{
    private readonly ITransactionRepository _repository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IFinanceModelFactory _modelFactory;
    private readonly IEnumerable<ITransactionFormatProvider> _formatProviders;

    public TransactionService(
        FinanceTracker.Api.Repositories.Factories.IRepositoryFactory repositoryFactory, 
        IFinanceModelFactory modelFactory,
        IEnumerable<ITransactionFormatProvider> formatProviders)
    {
        _repository = repositoryFactory.GetTransactionRepository();
        _categoryRepository = repositoryFactory.GetCategoryRepository();
        _modelFactory = modelFactory;
        _formatProviders = formatProviders;
    }

    public async Task<TransactionResponseDto?> GetByIdAsync(Guid id, Guid userId)
    {
        var transaction = await _repository.GetByIdAsync(id);
        if (transaction == null || transaction.UserId != userId) return null;

        return MapToResponse(transaction);
    }

    public async Task<IEnumerable<TransactionResponseDto>> GetTransactionsAsync(Guid userId, TransactionFilterDto filter)
    {
        var transactions = await _repository.GetByUserIdAsync(userId, filter.StartDate, filter.EndDate, filter.CategoryId, filter.Type, filter.SearchTerm, filter.MinAmount, filter.MaxAmount);
        return transactions.Select(MapToResponse);
    }

    public async Task<TransactionResponseDto> AddAsync(Guid userId, TransactionCreateDto dto)
    {
        var transaction = _modelFactory.CreateTransaction(dto.Amount, dto.Date, dto.CategoryId, userId, dto.Note);
        var created = await _repository.AddAsync(transaction);
        var loaded = await _repository.GetByIdAsync(created.Id);
        return MapToResponse(loaded ?? created); 
    }

    public async Task<IEnumerable<TransactionResponseDto>> AddBulkAsync(Guid userId, IEnumerable<TransactionCreateDto> dtos)
    {
        var transactions = dtos.Select(dto => _modelFactory.CreateTransaction(dto.Amount, dto.Date, dto.CategoryId, userId, dto.Note)).ToList();
        await _repository.AddRangeAsync(transactions);
        return transactions.Select(MapToResponse);
    }

    public async Task UpdateAsync(Guid userId, TransactionUpdateDto dto)
    {
        var transaction = await _repository.GetByIdAsync(dto.Id);
        if (transaction == null || transaction.UserId != userId)
            throw new UnauthorizedAccessException("Transaction not found or access denied.");

        transaction.Amount = dto.Amount;
        transaction.Date = dto.Date;
        transaction.Note = dto.Note;
        transaction.CategoryId = dto.CategoryId;

        await _repository.UpdateAsync(transaction);
    }

    public async Task DeleteAsync(Guid id, Guid userId)
    {
        var transaction = await _repository.GetByIdAsync(id);
        if (transaction == null || transaction.UserId != userId)
            throw new UnauthorizedAccessException("Transaction not found or access denied.");

        await _repository.DeleteAsync(transaction);
    }

    public async Task DeleteBulkAsync(Guid userId, TransactionFilterDto filter)
    {
        var transactions = await _repository.GetByUserIdAsync(userId, filter.StartDate, filter.EndDate, filter.CategoryId, filter.Type, filter.SearchTerm, filter.MinAmount, filter.MaxAmount);
        if (transactions.Any())
        {
            await _repository.DeleteRangeAsync(transactions);
        }
    }

    public async Task<byte[]> ExportAsync(Guid userId, TransactionFilterDto filter, string format)
    {
        var provider = GetProvider(format);
        var transactions = await GetTransactionsAsync(userId, filter);
        return await provider.ExportAsync(transactions);
    }

    public async Task<TransactionImportResultDto> ImportWithValidationAsync(Guid userId, Stream fileStream, string format)
    {
        var provider = GetProvider(format);
        var importedRows = (await provider.ParseImportAsync(fileStream)).ToList();

        var result = new TransactionImportResultDto
        {
            TotalRead = importedRows.Count
        };

        if (importedRows.Count == 0)
        {
            result.Message = "Keine gültigen Datensätze in der Datei gefunden.";
            return result;
        }

        var existingTransactions = (await _repository.GetByUserIdAsync(userId)).ToList();
        var existingCategories = (await _categoryRepository.GetVisibleAsync(userId)).ToList();
        var defaultCatId = existingCategories.FirstOrDefault(c => c.Name.Equals("Sonstiges", StringComparison.OrdinalIgnoreCase))?.Id
                           ?? existingCategories.FirstOrDefault()?.Id ?? 10;

        var existingIds = new HashSet<Guid>(existingTransactions.Select(t => t.Id));
        var existingTuples = new HashSet<string>(
            existingTransactions.Select(t => $"{t.Date.Date:yyyy-MM-dd}_{t.CategoryId}_{Math.Abs(t.Amount):F2}")
        );

        foreach (var row in importedRows)
        {
            if (row.Amount == 0 || row.Date == default)
            {
                result.SkippedErrorsCount++;
                result.Errors.Add($"Ungültige Zeile übersprungen: Betrag = {row.Amount}, Datum = {row.Date:yyyy-MM-dd}");
                continue;
            }

            if (string.IsNullOrWhiteSpace(row.CategoryName))
            {
                result.SkippedErrorsCount++;
                result.Errors.Add($"Zeile übersprungen: Kategorie fehlt (Betrag {row.Amount:F2} € am {row.Date:yyyy-MM-dd}).");
                continue;
            }

            // Strict Category Check: Match row.CategoryName against existingCategories
            var category = existingCategories.FirstOrDefault(c => c.Name.Equals(row.CategoryName, StringComparison.OrdinalIgnoreCase));
            if (category == null)
            {
                result.SkippedErrorsCount++;
                result.Errors.Add($"Zeile übersprungen: Kategorie '{row.CategoryName}' existiert nicht im System.");
                continue;
            }

            var categoryId = category.Id;
            var absAmount = Math.Abs(row.Amount);
            var tupleKey = $"{row.Date.Date:yyyy-MM-dd}_{categoryId}_{absAmount:F2}";

            // Primary Check: UUID
            if (row.Id.HasValue && existingIds.Contains(row.Id.Value))
            {
                result.SkippedDuplicatesCount++;
                continue;
            }

            // Secondary Check: Date + Category + Amount
            if (existingTuples.Contains(tupleKey))
            {
                result.SkippedDuplicatesCount++;
                continue;
            }

            // Valid non-duplicate transaction
            var newId = row.Id.HasValue && row.Id.Value != Guid.Empty ? row.Id.Value : Guid.NewGuid();
            var dateUtc = DateTime.SpecifyKind(row.Date, DateTimeKind.Utc);
            var tx = _modelFactory.CreateTransaction(row.Amount, dateUtc, categoryId, userId, row.Note);
            tx.Id = newId;

            await _repository.AddAsync(tx);

            existingIds.Add(newId);
            existingTuples.Add(tupleKey);
            result.ImportedCount++;
        }

        result.Message = $"{result.ImportedCount} Transaktion(en) erfolgreich importiert. {result.SkippedDuplicatesCount} Duplikat(e) übersprungen. {result.SkippedErrorsCount} fehlerhafte Zeile(n) übersprungen.";
        return result;
    }

    public async Task<(byte[] content, string contentType, string fileName)> GetTemplateAsync(string format)
    {
        var provider = GetProvider(format);
        var bytes = await provider.GenerateTemplateAsync();
        return (bytes, provider.ContentType, $"Transaktionen_Vorlage{provider.FileExtension}");
    }

    private ITransactionFormatProvider GetProvider(string format)
    {
        var formatted = format.ToLowerInvariant();
        var provider = _formatProviders.FirstOrDefault(p => p.FormatName == formatted);
        if (provider == null) throw new NotSupportedException($"Export format '{formatted}' is not supported.");
        return provider;
    }

    private static TransactionResponseDto MapToResponse(Transaction t)
    {
        return new TransactionResponseDto
        {
            Id = t.Id,
            Amount = t.Amount,
            Date = t.Date,
            Note = t.Note ?? string.Empty,
            CategoryId = t.CategoryId,
            CategoryName = t.Category?.Name ?? string.Empty,
            CategoryType = t.Category != null ? t.Category.Type.ToString() : string.Empty,
            CategoryExpenseType = t.Category != null ? t.Category.ExpenseType.ToString() : string.Empty
        };
    }
}
