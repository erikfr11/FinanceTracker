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

    private static readonly JsonSerializerOptions JsonOptions = new JsonSerializerOptions
    {
        WriteIndented = true,
        PropertyNameCaseInsensitive = true
    };

    public async Task<byte[]> ExportAsync(IEnumerable<TransactionResponseDto> transactions)
    {
        var exportList = transactions.Select(t => new
        {
            id = t.Id,
            date = t.Date.ToString("yyyy-MM-dd"),
            amount = t.Amount,
            categoryName = t.CategoryName,
            note = t.Note ?? string.Empty
        });

        var json = JsonSerializer.Serialize(exportList, JsonOptions);
        return await Task.FromResult(Encoding.UTF8.GetBytes(json));
    }

    public async Task<IEnumerable<TransactionImportDto>> ParseImportAsync(Stream fileStream)
    {
        var list = await JsonSerializer.DeserializeAsync<List<TransactionImportDto>>(fileStream, JsonOptions);
        return list ?? new List<TransactionImportDto>();
    }

    public async Task<byte[]> GenerateTemplateAsync()
    {
        var template = new[]
        {
            new
            {
                date = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                amount = 85.50m,
                categoryName = "Lebensmittel",
                note = "Wocheneinkauf Supermarkt"
            },
            new
            {
                date = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                amount = 2500.00m,
                categoryName = "Gehalt",
                note = "Monatsgehalt"
            }
        };

        var json = JsonSerializer.Serialize(template, JsonOptions);
        return await Task.FromResult(Encoding.UTF8.GetBytes(json));
    }
}
