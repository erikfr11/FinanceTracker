using System.Text;
using System.Text.Json;
using FinanceTracker.Api.Models.DTOs;
using FinanceTracker.Api.Services.Interfaces;

namespace FinanceTracker.Api.Services.FormatProviders;

public class JsonTransactionProvider : ITransactionFormatProvider
{
    public string FormatName => "json";
    public string ContentType => "application/json";
    public string FileExtension => ".json";

    public async Task<byte[]> ExportAsync(IEnumerable<TransactionResponseDto> transactions)
    {
        var options = new JsonSerializerOptions { WriteIndented = true };
        var json = JsonSerializer.Serialize(transactions, options);
        return await Task.FromResult(Encoding.UTF8.GetBytes(json));
    }

    public async Task<IEnumerable<TransactionCreateDto>> ImportAsync(Stream fileStream)
    {
        var dtos = await JsonSerializer.DeserializeAsync<IEnumerable<TransactionCreateDto>>(fileStream, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        return dtos ?? Enumerable.Empty<TransactionCreateDto>();
    }
}
