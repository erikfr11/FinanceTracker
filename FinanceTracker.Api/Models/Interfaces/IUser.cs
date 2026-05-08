namespace FinanceTracker.Api.Models.Interfaces;

/// <summary>
/// Defines the contract for the application user entity.
/// </summary>
public interface IUser
{
    Guid Id { get; set; }
    string FirstName { get; set; }
    string LastName { get; set; }
    string? Email { get; set; }
    string? UserName { get; set; }

    /// <summary>
    /// Navigation property: all transactions belonging to this user.
    /// </summary>
    ICollection<Transaction> Transactions { get; set; }

    /// <summary>
    /// Returns the user's full display name.
    /// </summary>
    string FullName { get; }

    /// <summary>
    /// Validates that required user properties are set.
    /// </summary>
    bool IsValid();
}
