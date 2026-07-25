using System.Globalization;
using System.Text;
using CsvHelper;
using CsvHelper.Configuration;
using FinanceTracker.Api.Models.DTOs;
using FinanceTracker.Api.Services.Interfaces;

namespace FinanceTracker.Api.Services.FormatProviders;

public class CsvTransactionProvider : ITransactionFormatProvider
{
    public string FormatName => "csv";
    public string ContentType => "text/csv";
    public string FileExtension => ".csv";

    public async Task<byte[]> ExportAsync(IEnumerable<TransactionResponseDto> transactions)
    {
        using var memoryStream = new MemoryStream();
        using var writer = new StreamWriter(memoryStream, Encoding.UTF8);
        using var csv = new CsvWriter(writer, new CsvConfiguration(CultureInfo.InvariantCulture) { Delimiter = ";" });

        var exportList = transactions.Select(t => new
        {
            Id = t.Id,
            Date = t.Date.ToString("yyyy-MM-dd"),
            Amount = t.Amount.ToString("F2", CultureInfo.InvariantCulture),
            CategoryName = t.CategoryName,
            Note = t.Note ?? string.Empty
        });

        await csv.WriteRecordsAsync(exportList);
        await writer.FlushAsync();
        return memoryStream.ToArray();
    }

    public async Task<IEnumerable<TransactionImportDto>> ParseImportAsync(Stream fileStream)
    {
        using var reader = new StreamReader(fileStream, Encoding.UTF8);

        // Detect delimiter (comma or semicolon)
        var content = await reader.ReadToEndAsync();
        var delimiter = content.Contains(";") ? ";" : ",";

        using var memoryStream = new MemoryStream(Encoding.UTF8.GetBytes(content));
        using var streamReader = new StreamReader(memoryStream, Encoding.UTF8);
        using var csv = new CsvReader(streamReader, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            Delimiter = delimiter,
            HeaderValidated = null,
            MissingFieldFound = null,
            PrepareHeaderForMatch = args => args.Header.Trim().ToLowerInvariant()
        });

        var results = new List<TransactionImportDto>();
        await csv.ReadAsync();
        csv.ReadHeader();

        while (await csv.ReadAsync())
        {
            try
            {
                var idStr = csv.GetField<string>("id");
                Guid? id = Guid.TryParse(idStr, out var parsedGuid) ? parsedGuid : null;

                var dateStr = csv.GetField<string>("date");
                if (!DateTime.TryParse(dateStr, CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
                {
                    DateTime.TryParse(dateStr, out date);
                }

                var amountStr = csv.GetField<string>("amount")?.Replace(",", ".");
                decimal.TryParse(amountStr, NumberStyles.Any, CultureInfo.InvariantCulture, out var amount);

                var categoryName = csv.GetField<string>("categoryname") ?? csv.GetField<string>("category") ?? string.Empty;
                var note = csv.GetField<string>("note") ?? csv.GetField<string>("description") ?? string.Empty;

                results.Add(new TransactionImportDto
                {
                    Id = id,
                    Date = date,
                    Amount = amount,
                    CategoryName = categoryName.Trim(),
                    Note = note.Trim()
                });
            }
            catch
            {
                // Skip unparseable row
            }
        }

        return results;
    }

    public async Task<byte[]> GenerateTemplateAsync()
    {
        var sb = new StringBuilder();
        sb.AppendLine("Date;Amount;CategoryName;Note");
        sb.AppendLine($"{DateTime.UtcNow:yyyy-MM-dd};85.50;Lebensmittel;Wocheneinkauf Supermarkt");
        sb.AppendLine($"{DateTime.UtcNow:yyyy-MM-dd};2500.00;Gehalt;Monatsgehalt");

        return await Task.FromResult(Encoding.UTF8.GetBytes(sb.ToString()));
    }
}
