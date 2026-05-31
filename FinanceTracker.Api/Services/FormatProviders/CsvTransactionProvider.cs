using System.Globalization;
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
        using var writer = new StreamWriter(memoryStream);
        using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

        await csv.WriteRecordsAsync(transactions);
        await writer.FlushAsync();
        return memoryStream.ToArray();
    }

    public async Task<IEnumerable<TransactionCreateDto>> ImportAsync(Stream fileStream)
    {
        using var reader = new StreamReader(fileStream);
        using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
             HeaderValidated = null,
             MissingFieldFound = null 
        });

        // The CSV should match TransactionCreateDto columns (Amount, Date, Note, CategoryId)
        var records = csv.GetRecords<TransactionCreateDto>().ToList();
        return await Task.FromResult(records);
    }
}
