namespace FinanceTracker.Api.Models.DTOs;

public class ThemeSettingsDto
{
    // Dark Mode Palette
    public string DarkPageBg { get; set; } = "#020617";
    public string DarkCardBg { get; set; } = "#0f172a";
    public string DarkSurfaceBg { get; set; } = "#1e293b";
    public string DarkBorderColor { get; set; } = "#334155";
    public string DarkTextPrimary { get; set; } = "#f1f5f9";
    public string DarkTextSecondary { get; set; } = "#cbd5e1";
    public string DarkTextMuted { get; set; } = "#94a3b8";

    // Light Mode Palette
    public string LightPageBg { get; set; } = "#f8fafc";
    public string LightCardBg { get; set; } = "#ffffff";
    public string LightSurfaceBg { get; set; } = "#f1f5f9";
    public string LightBorderColor { get; set; } = "#e2e8f0";
    public string LightTextPrimary { get; set; } = "#0f172a";
    public string LightTextSecondary { get; set; } = "#475569";
    public string LightTextMuted { get; set; } = "#64748b";

    // Primary Accents
    public string PrimaryColor { get; set; } = "#2563eb";
    public string IncomeColor { get; set; } = "#10b981";
    public string ExpenseColor { get; set; } = "#ef4444";
}
