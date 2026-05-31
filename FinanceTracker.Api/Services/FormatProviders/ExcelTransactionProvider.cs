using ClosedXML.Excel;
using FinanceTracker.Api.Models.DTOs;
using FinanceTracker.Api.Services.Interfaces;

namespace FinanceTracker.Api.Services.FormatProviders;

public class ExcelTransactionProvider : ITransactionFormatProvider
{
    public string FormatName => "excel";
    public string ContentType => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    public string FileExtension => ".xlsx";

    public async Task<byte[]> ExportAsync(IEnumerable<TransactionResponseDto> transactions)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Transactions");

        // Headers
        worksheet.Cell(1, 1).Value = "Id";
        worksheet.Cell(1, 2).Value = "Amount";
        worksheet.Cell(1, 3).Value = "Date";
        worksheet.Cell(1, 4).Value = "Note";
        worksheet.Cell(1, 5).Value = "CategoryName";
        worksheet.Cell(1, 6).Value = "CategoryType";

        var row = 2;
        foreach (var t in transactions)
        {
            worksheet.Cell(row, 1).Value = t.Id.ToString();
            worksheet.Cell(row, 2).Value = t.Amount;
            worksheet.Cell(row, 3).Value = t.Date.ToString("yyyy-MM-dd");
            worksheet.Cell(row, 4).Value = t.Note;
            worksheet.Cell(row, 5).Value = t.CategoryName;
            worksheet.Cell(row, 6).Value = t.CategoryType;
            row++;
        }

        worksheet.Columns().AdjustToContents();

        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return await Task.FromResult(ms.ToArray());
    }

    public async Task<IEnumerable<TransactionCreateDto>> ImportAsync(Stream fileStream)
    {
        var transactions = new List<TransactionCreateDto>();
        
        using var workbook = new XLWorkbook(fileStream);
        var worksheet = workbook.Worksheet(1);
        var rows = worksheet.RangeUsed()?.RowsUsed()?.Skip(1); // Skip header

        if (rows == null) return transactions;

        foreach (var row in rows)
        {
            var amountStr = row.Cell(1).GetString(); // Assuming column 1 is Amount for import
            var dateStr = row.Cell(2).GetString();   // Column 2 Date
            var note = row.Cell(3).GetString();      // Column 3 Note
            var catIdStr = row.Cell(4).GetString();  // Column 4 CategoryId

            if (decimal.TryParse(amountStr, out var amount) &&
                DateTime.TryParse(dateStr, out var date) &&
                int.TryParse(catIdStr, out var catId))
            {
                transactions.Add(new TransactionCreateDto
                {
                    Amount = amount,
                    Date = date,
                    Note = note,
                    CategoryId = catId
                });
            }
        }

        return await Task.FromResult(transactions);
    }
}
