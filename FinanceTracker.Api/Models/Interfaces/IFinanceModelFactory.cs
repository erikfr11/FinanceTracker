using FinanceTracker.Api.Models.Enums;
using FinanceTracker.Api.Models;

namespace FinanceTracker.Api.Models.Interfaces;

/// <summary>
/// Central factory for creating domain model instances.
/// Ensures all created models are properly initialized and validated.
/// </summary>
public interface IFinanceModelFactory
{
    /// <summary>
    /// Creates a new User instance.
    /// </summary>
    User CreateUser(string email, string firstName, string lastName, string? userName = null, string preferredCurrency = "EUR", string locale = "de-DE", bool isPremiumUser = false, string? avatarUrl = null);

    /// <summary>
    /// Creates a new Category instance.
    /// </summary>
    Category CreateCategory(string name, CategoryType type, ExpenseType expenseType, bool isSystemCategory = false, Guid? userId = null);

    /// <summary>
    /// Creates a new Transaction instance.
    /// </summary>
    Transaction CreateTransaction(decimal amount, DateTime date, int categoryId, Guid userId, string? note = null);
}
