namespace FinanceTracker.Api.Models.DTOs;

public class TransactionImportDto
{
    public Guid? Id { get; set; }
    public DateTime Date { get; set; }
    public decimal Amount { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? Note { get; set; }
}
