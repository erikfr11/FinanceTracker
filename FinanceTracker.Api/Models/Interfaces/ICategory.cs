using FinanceTracker.Api.Models.Enums;

namespace FinanceTracker.Api.Models.Interfaces;

/// <summary>
/// Defines the contract for the category entity.
/// </summary>
public interface ICategory
{
    int Id { get; set; }
    string Name { get; set; }
    CategoryType Type { get; set; }
    ExpenseType ExpenseType { get; set; }
    bool IsSystemCategory { get; set; }

    /// <summary>
    /// Navigation property: all transactions assigned to this category.
    /// </summary>
    ICollection<Transaction> Transactions { get; set; }

    /// <summary>
    /// Validates that the category has a valid name, type,
    /// and a consistent ExpenseType (Income → None, Expense → Fixed|Variable).
    /// </summary>
    bool IsValid();
}
