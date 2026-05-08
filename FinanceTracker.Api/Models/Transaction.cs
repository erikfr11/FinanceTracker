using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using FinanceTracker.Api.Models.Interfaces;

namespace FinanceTracker.Api.Models;

/// <summary>
/// Represents a single financial transaction (income or expense).
/// Uses Guid as primary key. CategoryId remains int, UserId is Guid.
/// </summary>
public class Transaction : ITransaction
{
    public Guid Id { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }

    // ── Foreign Keys ────────────────────────────────────────────────

    [Required]
    public int CategoryId { get; set; }

    [Required]
    public Guid UserId { get; set; }

    // ── Navigation Properties ───────────────────────────────────────

    [ForeignKey(nameof(CategoryId))]
    public Category Category { get; set; } = null!;

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    // ── Domain Logic ────────────────────────────────────────────────

    /// <summary>
    /// Validates the complete state of the transaction,
    /// including consistency of the linked category.
    /// </summary>
    public bool IsValid()
    {
        if (Amount <= 0)
            return false;

        if (Date == default)
            return false;

        if (CategoryId <= 0)
            return false;

        if (UserId == Guid.Empty)
            return false;

        // If the category navigation property is loaded, validate it too
        if (Category is not null && !Category.IsValid())
            return false;

        return true;
    }

    /// <summary>
    /// Throws an <see cref="InvalidOperationException"/> if the amount is
    /// zero or negative. Use this as a guard clause before persisting.
    /// </summary>
    public void EnsureValidAmount()
    {
        if (Amount <= 0)
            throw new InvalidOperationException(
                $"Transaction amount must be greater than zero. Received: {Amount}");
    }
}
