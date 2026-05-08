using System.ComponentModel.DataAnnotations;
using FinanceTracker.Api.Models.Enums;
using FinanceTracker.Api.Models.Interfaces;

namespace FinanceTracker.Api.Models;

/// <summary>
/// Represents a transaction category (e.g. "Gehalt", "Lebensmittel").
/// Can be a system-wide admin category or a user-defined one.
/// </summary>
public class Category : ICategory
{
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public CategoryType Type { get; set; }

    /// <summary>
    /// Sub-classification for expense categories.
    /// Must be <see cref="ExpenseType.None"/> when <see cref="Type"/> is Income.
    /// Must be <see cref="ExpenseType.Fixed"/> or <see cref="ExpenseType.Variable"/> when Expense.
    /// </summary>
    [Required]
    public ExpenseType ExpenseType { get; set; } = ExpenseType.None;

    /// <summary>
    /// If true, this is a system-wide category managed by an admin
    /// and cannot be deleted by regular users.
    /// </summary>
    public bool IsSystemCategory { get; set; }

    /// <summary>
    /// All transactions assigned to this category.
    /// </summary>
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();

    // ── Domain Logic ────────────────────────────────────────────────

    /// <summary>
    /// Validates that the category has meaningful data and
    /// that the ExpenseType is consistent with the CategoryType.
    /// </summary>
    public bool IsValid()
    {
        if (string.IsNullOrWhiteSpace(Name))
            return false;

        if (!Enum.IsDefined(typeof(CategoryType), Type))
            return false;

        if (!Enum.IsDefined(typeof(ExpenseType), ExpenseType))
            return false;

        // Income categories must have ExpenseType.None
        if (Type == CategoryType.Income && ExpenseType != ExpenseType.None)
            return false;

        // Expense categories must be either Fixed or Variable
        if (Type == CategoryType.Expense && ExpenseType == ExpenseType.None)
            return false;

        return true;
    }
}
