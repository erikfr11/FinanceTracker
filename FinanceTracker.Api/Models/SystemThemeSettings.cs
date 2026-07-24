using System.ComponentModel.DataAnnotations;

namespace FinanceTracker.Api.Models;

/// <summary>
/// Entity representing global site-wide theme & color customization settings.
/// Stores hex colors for both Dark and Light mode as well as primary accent colors.
/// </summary>
public class SystemThemeSettings
{
    [Key]
    public int Id { get; set; } = 1;

    // ── Dark Mode Palette ──────────────────────────────────────────────
    [Required, MaxLength(9)]
    public string DarkPageBg { get; set; } = "#020617";

    [Required, MaxLength(9)]
    public string DarkCardBg { get; set; } = "#0f172a";

    [Required, MaxLength(9)]
    public string DarkSurfaceBg { get; set; } = "#1e293b";

    [Required, MaxLength(9)]
    public string DarkBorderColor { get; set; } = "#334155";

    [Required, MaxLength(9)]
    public string DarkTextPrimary { get; set; } = "#f1f5f9";

    [Required, MaxLength(9)]
    public string DarkTextSecondary { get; set; } = "#cbd5e1";

    [Required, MaxLength(9)]
    public string DarkTextMuted { get; set; } = "#94a3b8";

    // ── Light Mode Palette ─────────────────────────────────────────────
    [Required, MaxLength(9)]
    public string LightPageBg { get; set; } = "#f8fafc";

    [Required, MaxLength(9)]
    public string LightCardBg { get; set; } = "#ffffff";

    [Required, MaxLength(9)]
    public string LightSurfaceBg { get; set; } = "#f1f5f9";

    [Required, MaxLength(9)]
    public string LightBorderColor { get; set; } = "#e2e8f0";

    [Required, MaxLength(9)]
    public string LightTextPrimary { get; set; } = "#0f172a";

    [Required, MaxLength(9)]
    public string LightTextSecondary { get; set; } = "#475569";

    [Required, MaxLength(9)]
    public string LightTextMuted { get; set; } = "#64748b";

    // ── Primary Accent Colors ──────────────────────────────────────────
    [Required, MaxLength(9)]
    public string PrimaryColor { get; set; } = "#2563eb";

    [Required, MaxLength(9)]
    public string IncomeColor { get; set; } = "#10b981";

    [Required, MaxLength(9)]
    public string ExpenseColor { get; set; } = "#ef4444";
}
