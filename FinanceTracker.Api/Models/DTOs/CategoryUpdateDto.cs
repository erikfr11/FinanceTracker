using System.ComponentModel.DataAnnotations;
using FinanceTracker.Api.Models.Enums;

namespace FinanceTracker.Api.Models.DTOs;

public class CategoryUpdateDto
{
    [Required]
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public CategoryType Type { get; set; }

    [Required]
    public ExpenseType ExpenseType { get; set; }

    public bool IsSystemCategory { get; set; }
}
