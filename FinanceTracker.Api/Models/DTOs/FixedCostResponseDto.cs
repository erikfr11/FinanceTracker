namespace FinanceTracker.Api.Models.DTOs;

public class FixedCostResponseDto
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; }
    public int DueDayOfMonth { get; set; }
    public string Frequency { get; set; } = "Monthly";
    public string Note { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryType { get; set; } = string.Empty;
    public string CategoryExpenseType { get; set; } = string.Empty;
    public string? LastGeneratedYearMonth { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
