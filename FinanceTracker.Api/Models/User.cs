using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
using FinanceTracker.Api.Models.Interfaces;

namespace FinanceTracker.Api.Models;

/// <summary>
/// Application user extending ASP.NET Core Identity with financial profile data.
/// Uses Guid as primary key type.
/// </summary>
public class User : IdentityUser<Guid>, IUser
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// All transactions created by this user.
    /// </summary>
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();

    /// <summary>
    /// Computed full display name.
    /// </summary>
    public string FullName => $"{FirstName} {LastName}".Trim();

    /// <summary>
    /// Validates that the user has the minimum required data.
    /// </summary>
    public bool IsValid()
    {
        if (string.IsNullOrWhiteSpace(FirstName))
            return false;

        if (string.IsNullOrWhiteSpace(LastName))
            return false;

        if (string.IsNullOrWhiteSpace(Email))
            return false;

        return true;
    }
}
