using FinanceTracker.Api.Models.DTOs;

namespace FinanceTracker.Api.Services.Interfaces;

public interface ITransactionService
{
    Task<TransactionResponseDto?> GetByIdAsync(Guid id, Guid userId);
    Task<IEnumerable<TransactionResponseDto>> GetTransactionsAsync(Guid userId, TransactionFilterDto filter);
    
    Task<TransactionResponseDto> AddAsync(Guid userId, TransactionCreateDto dto);
    Task<IEnumerable<TransactionResponseDto>> AddBulkAsync(Guid userId, IEnumerable<TransactionCreateDto> dtos);
    
    Task UpdateAsync(Guid userId, TransactionUpdateDto dto);
    
    Task DeleteAsync(Guid id, Guid userId);
    Task DeleteBulkAsync(Guid userId, TransactionFilterDto filter);

    Task<byte[]> ExportAsync(Guid userId, TransactionFilterDto filter, string format);
    Task<IEnumerable<TransactionResponseDto>> ImportAsync(Guid userId, Stream fileStream, string format);
}
