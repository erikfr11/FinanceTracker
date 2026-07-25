using System.ComponentModel.DataAnnotations;

namespace FinanceTracker.Api.Models.DTOs;

public class FixedCostUpdateDto
{
    [Required]
    public Guid Id { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0.")]
    public decimal Amount { get; set; }

    [Range(1, 31, ErrorMessage = "Due day of month must be between 1 and 31.")]
    public int DueDayOfMonth { get; set; } = 1;

    public FinanceTracker.Api.Models.Enums.FixedCostFrequency Frequency { get; set; } = FinanceTracker.Api.Models.Enums.FixedCostFrequency.Monthly;

    [MaxLength(500)]
    public string Note { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    [Required]
    public int CategoryId { get; set; }
}
