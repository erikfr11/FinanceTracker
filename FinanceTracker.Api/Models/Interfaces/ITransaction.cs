namespace FinanceTracker.Api.Models.Interfaces;

/// <summary>
/// Defines the contract for the transaction entity.
/// </summary>
public interface ITransaction
{
    Guid Id { get; set; }
    decimal Amount { get; set; }
    DateTime Date { get; set; }
    string? Note { get; set; }

    // Foreign keys
    int CategoryId { get; set; }
    Guid UserId { get; set; }

    // Navigation properties
    Category Category { get; set; }
    User User { get; set; }

    /// <summary>
    /// Validates the full transaction state, including linked category consistency.
    /// </summary>
    bool IsValid();

    /// <summary>
    /// Ensures the amount is a positive, non-zero value. Throws if invalid.
    /// </summary>
    void EnsureValidAmount();
}
