namespace FinanceTracker.Api.Models.Enums;

/// <summary>
/// Defines the expense sub-type for expense categories.
/// Income categories must always use <see cref="None"/>.
/// </summary>
public enum ExpenseType
{
    /// <summary>Used for Income categories – no expense classification.</summary>
    None = 0,

    /// <summary>Fixed recurring expenses (e.g. rent, insurance).</summary>
    Fixed = 1,

    /// <summary>Variable expenses (e.g. groceries, entertainment).</summary>
    Variable = 2
}
