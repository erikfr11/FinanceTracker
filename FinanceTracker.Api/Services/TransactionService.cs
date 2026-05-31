using FinanceTracker.Api.Models;
using FinanceTracker.Api.Models.DTOs;
using FinanceTracker.Api.Models.Interfaces;
using FinanceTracker.Api.Repositories.Interfaces;
using FinanceTracker.Api.Services.Interfaces;

namespace FinanceTracker.Api.Services;

public class TransactionService : ITransactionService
{
    private readonly ITransactionRepository _repository;
    private readonly IFinanceModelFactory _modelFactory;
    private readonly IEnumerable<ITransactionFormatProvider> _formatProviders;

    public TransactionService(
        FinanceTracker.Api.Repositories.Factories.IRepositoryFactory repositoryFactory, 
        IFinanceModelFactory modelFactory,
        IEnumerable<ITransactionFormatProvider> formatProviders)
    {
        _repository = repositoryFactory.GetTransactionRepository();
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
        var transactions = await _repository.GetByUserIdAsync(userId, filter.StartDate, filter.EndDate, filter.CategoryId, filter.Type);
        return transactions.Select(MapToResponse);
    }

    public async Task<TransactionResponseDto> AddAsync(Guid userId, TransactionCreateDto dto)
    {
        var transaction = _modelFactory.CreateTransaction(dto.Amount, dto.Date, dto.CategoryId, userId, dto.Note);
        var created = await _repository.AddAsync(transaction);
        // Note: Category data won't be immediately populated unless we re-fetch, but for add we can omit it or re-fetch.
        // Doing a simple return here; real app we might fetch the category explicitly if Response expects it fully populated.
        return MapToResponse(created); 
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
        var transactions = await _repository.GetByUserIdAsync(userId, filter.StartDate, filter.EndDate, filter.CategoryId, filter.Type);
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

    public async Task<IEnumerable<TransactionResponseDto>> ImportAsync(Guid userId, Stream fileStream, string format)
    {
        var provider = GetProvider(format);
        var dtos = await provider.ImportAsync(fileStream);

        // Optional duplicate checking logic could be placed here before executing bulk add.
        // For standard requirement, we simply interpret and save.
        return await AddBulkAsync(userId, dtos);
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
            Note = t.Note,
            CategoryId = t.CategoryId,
            CategoryName = t.Category?.Name ?? string.Empty,
            CategoryType = t.Category != null ? t.Category.Type.ToString() : string.Empty
        };
    }
}
