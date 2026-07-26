using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using FinanceTracker.Api.Models.Enums;

namespace FinanceTracker.Api.Models;

/// <summary>
/// Represents a recurring fixed cost rule for a user.
/// Automatically generates monthly transactions on the specified due day of the month.
/// </summary>
public class FixedCost
{
    public Guid Id { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Range(1, 31)]
    public int DueDayOfMonth { get; set; } = 1;

    [MaxLength(500)]
    public string Note { get; set; } = string.Empty;

    public FixedCostFrequency Frequency { get; set; } = FixedCostFrequency.Monthly;

    public bool IsActive { get; set; } = true;

    [Required]
    public int CategoryId { get; set; }

    [ForeignKey(nameof(CategoryId))]
    public Category Category { get; set; } = null!;

    [Required]
    public Guid UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    /// <summary>
    /// Tracks the last year-month (e.g. "2026-07") when a transaction was generated for this rule.
    /// Prevents duplicate generation within the same month.
    /// </summary>
    [MaxLength(50)]
    public string? LastGeneratedYearMonth { get; set; }

    /// <summary>
    /// The first execution date. The rule will not generate transactions before this date.
    /// </summary>
    public DateTime StartDate { get; set; } = DateTime.UtcNow.Date;

    /// <summary>
    /// Optional last execution date. If null, the rule runs indefinitely (unendlich).
    /// </summary>
    public DateTime? EndDate { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
