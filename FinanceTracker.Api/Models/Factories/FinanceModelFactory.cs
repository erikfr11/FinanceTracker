using FinanceTracker.Api.Models.Enums;
using FinanceTracker.Api.Models.Interfaces;

namespace FinanceTracker.Api.Models.Factories;

/// <summary>
/// Implementation of IFinanceModelFactory.
/// Encapsulates object creation and ensures valid domain state using model validation methods.
/// </summary>
public class FinanceModelFactory : IFinanceModelFactory
{
    public User CreateUser(string email, string firstName, string lastName, string? userName = null)
    {
        var user = new User
        {
            Email = email,
            UserName = userName ?? email,
            FirstName = firstName,
            LastName = lastName
        };

        if (!user.IsValid())
        {
            throw new ArgumentException("Provided user data is invalid.");
        }

        return user;
    }

    public Category CreateCategory(string name, CategoryType type, ExpenseType expenseType, bool isSystemCategory = false)
    {
        var category = new Category
        {
            Name = name,
            Type = type,
            ExpenseType = expenseType,
            IsSystemCategory = isSystemCategory
        };

        if (!category.IsValid())
        {
            throw new ArgumentException("Provided category data or type combination is invalid.");
        }

        return category;
    }

    public Transaction CreateTransaction(decimal amount, DateTime date, int categoryId, Guid userId, string? note = null)
    {
        var transaction = new Transaction
        {
            Amount = amount,
            Date = date,
            CategoryId = categoryId,
            UserId = userId,
            Note = note
        };

        // Ensure non-zero amount
        transaction.EnsureValidAmount();

        if (!transaction.IsValid())
        {
            throw new ArgumentException("Provided transaction data is invalid.");
        }

        return transaction;
    }
}
