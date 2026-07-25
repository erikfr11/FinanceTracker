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
            type = t.CategoryType,               // "Income" or "Expense"
            expenseType = t.CategoryExpenseType, // "Fixed", "Variable", "None"
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
                type = "Expense",
                expenseType = "Variable",
                note = "Wocheneinkauf Supermarkt"
            },
            new
            {
                date = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                amount = 2500.00m,
                categoryName = "Gehalt",
                type = "Income",
                expenseType = "None",
                note = "Monatsgehalt"
            },
            new
            {
                date = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                amount = 850.00m,
                categoryName = "Miete",
                type = "Expense",
                expenseType = "Fixed",
                note = "Wohnungsmiete"
            }
        };

        var json = JsonSerializer.Serialize(template, JsonOptions);
        return await Task.FromResult(Encoding.UTF8.GetBytes(json));
    }
}
