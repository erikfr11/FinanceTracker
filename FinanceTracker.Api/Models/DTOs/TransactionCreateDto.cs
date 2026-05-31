using System.ComponentModel.DataAnnotations;

namespace FinanceTracker.Api.Models.DTOs;

public class TransactionCreateDto
{
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0.")]
    public decimal Amount { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [MaxLength(500)]
    public string Note { get; set; } = string.Empty;

    [Required]
    public int CategoryId { get; set; }
}
