using System.Globalization;
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
        var worksheet = workbook.Worksheets.Add("Transaktionen");

        // Headers
        worksheet.Cell(1, 1).Value = "Id";
        worksheet.Cell(1, 2).Value = "Date";
        worksheet.Cell(1, 3).Value = "Amount";
        worksheet.Cell(1, 4).Value = "CategoryName";
        worksheet.Cell(1, 5).Value = "Note";

        // Styling
        var headerRange = worksheet.Range(1, 1, 1, 5);
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#1e293b");
        headerRange.Style.Font.FontColor = XLColor.White;

        var row = 2;
        foreach (var t in transactions)
        {
            worksheet.Cell(row, 1).Value = t.Id.ToString();
            worksheet.Cell(row, 2).Value = t.Date.ToString("yyyy-MM-dd");
            worksheet.Cell(row, 3).Value = t.Amount;
            worksheet.Cell(row, 4).Value = t.CategoryName;
            worksheet.Cell(row, 5).Value = t.Note ?? string.Empty;
            row++;
        }

        worksheet.Columns().AdjustToContents();

        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return await Task.FromResult(ms.ToArray());
    }

    public async Task<IEnumerable<TransactionImportDto>> ParseImportAsync(Stream fileStream)
    {
        var list = new List<TransactionImportDto>();

        using var workbook = new XLWorkbook(fileStream);
        var worksheet = workbook.Worksheets.FirstOrDefault();
        if (worksheet == null) return list;

        var usedRange = worksheet.RangeUsed();
        if (usedRange == null) return list;

        var rows = usedRange.RowsUsed().ToList();
        if (rows.Count <= 1) return list;

        // Header mapping
        var headerRow = rows[0];
        int idCol = 0, dateCol = 0, amountCol = 0, catCol = 0, noteCol = 0;

        var lastCol = headerRow.LastCellUsed()?.Address.ColumnNumber ?? 5;
        for (int i = 1; i <= lastCol; i++)
        {
            var val = headerRow.Cell(i).GetString().Trim().ToLowerInvariant();
            if (val == "id") idCol = i;
            else if (val == "date" || val == "datum") dateCol = i;
            else if (val == "amount" || val == "betrag") amountCol = i;
            else if (val == "categoryname" || val == "category" || val == "kategorie") catCol = i;
            else if (val == "note" || val == "beschreibung" || val == "notiz") noteCol = i;
        }

        // Fallback column positions if headers missing
        if (dateCol == 0) dateCol = 2;
        if (amountCol == 0) amountCol = 3;
        if (catCol == 0) catCol = 4;
        if (noteCol == 0) noteCol = 5;
        if (idCol == 0) idCol = 1;

        foreach (var row in rows.Skip(1))
        {
            try
            {
                var idStr = row.Cell(idCol).GetString().Trim();
                Guid? id = Guid.TryParse(idStr, out var parsedGuid) ? parsedGuid : null;

                var dateStr = row.Cell(dateCol).GetString().Trim();
                DateTime date;
                if (!DateTime.TryParse(dateStr, CultureInfo.InvariantCulture, DateTimeStyles.None, out date))
                {
                    if (row.Cell(dateCol).DataType == XLDataType.DateTime)
                    {
                        date = row.Cell(dateCol).GetDateTime();
                    }
                    else
                    {
                        DateTime.TryParse(dateStr, out date);
                    }
                }

                decimal amount = 0;
                if (row.Cell(amountCol).DataType == XLDataType.Number)
                {
                    amount = Convert.ToDecimal(row.Cell(amountCol).GetDouble());
                }
                else
                {
                    var amtStr = row.Cell(amountCol).GetString().Replace(",", ".");
                    decimal.TryParse(amtStr, NumberStyles.Any, CultureInfo.InvariantCulture, out amount);
                }

                var catName = row.Cell(catCol).GetString().Trim();
                var note = row.Cell(noteCol).GetString().Trim();

                if (amount != 0 || !string.IsNullOrWhiteSpace(catName))
                {
                    list.Add(new TransactionImportDto
                    {
                        Id = id,
                        Date = date,
                        Amount = amount,
                        CategoryName = catName,
                        Note = note
                    });
                }
            }
            catch
            {
                // Skip invalid row
            }
        }

        return await Task.FromResult(list);
    }

    public async Task<byte[]> GenerateTemplateAsync()
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Vorlage");

        worksheet.Cell(1, 1).Value = "Date";
        worksheet.Cell(1, 2).Value = "Amount";
        worksheet.Cell(1, 3).Value = "CategoryName";
        worksheet.Cell(1, 4).Value = "Note";

        var headerRange = worksheet.Range(1, 1, 1, 4);
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#1e293b");
        headerRange.Style.Font.FontColor = XLColor.White;

        // Row 1
        worksheet.Cell(2, 1).Value = DateTime.UtcNow.ToString("yyyy-MM-dd");
        worksheet.Cell(2, 2).Value = 85.50m;
        worksheet.Cell(2, 3).Value = "Lebensmittel";
        worksheet.Cell(2, 4).Value = "Wocheneinkauf Supermarkt";

        // Row 2
        worksheet.Cell(3, 1).Value = DateTime.UtcNow.ToString("yyyy-MM-dd");
        worksheet.Cell(3, 2).Value = 2500.00m;
        worksheet.Cell(3, 3).Value = "Gehalt";
        worksheet.Cell(3, 4).Value = "Monatsgehalt";

        worksheet.Columns().AdjustToContents();

        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return await Task.FromResult(ms.ToArray());
    }
}
