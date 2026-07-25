namespace FinanceTracker.Api.Models.DTOs;

public class TransactionFilterDto
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? CategoryId { get; set; }
    public string? Type { get; set; } // e.g. "Income" or "Expense"
    public string? SearchTerm { get; set; }
    public decimal? MinAmount { get; set; }
    public decimal? MaxAmount { get; set; }
}
