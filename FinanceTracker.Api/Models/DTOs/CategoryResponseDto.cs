using FinanceTracker.Api.Models.Enums;

namespace FinanceTracker.Api.Models.DTOs;

public class CategoryResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string ExpenseType { get; set; } = string.Empty;
    public bool IsSystemCategory { get; set; }
    public bool IsOwnedByCurrentUser { get; set; }
}
