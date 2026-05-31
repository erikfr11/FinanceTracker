namespace FinanceTracker.Api.Models.DTOs;

public class TransactionFilterDto
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? CategoryId { get; set; }
    public string? Type { get; set; } // e.g. "Income" or "Expense"
}
