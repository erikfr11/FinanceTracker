namespace FinanceTracker.Api.Models.DTOs;

public class TransactionImportResultDto
{
    public int TotalRead { get; set; }
    public int ImportedCount { get; set; }
    public int SkippedDuplicatesCount { get; set; }
    public List<string> Errors { get; set; } = new();
    public string Message { get; set; } = string.Empty;
}
