using FinanceTracker.Api.Models.DTOs;

namespace FinanceTracker.Api.Services.Interfaces;

public interface ITransactionFormatProvider
{
    string FormatName { get; }      // "csv", "json", "excel"
    string ContentType { get; } 
    string FileExtension { get; }

    Task<byte[]> ExportAsync(IEnumerable<TransactionResponseDto> transactions);
    Task<IEnumerable<TransactionCreateDto>> ImportAsync(Stream fileStream);
}
