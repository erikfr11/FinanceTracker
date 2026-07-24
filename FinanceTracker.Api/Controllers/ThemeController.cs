using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinanceTracker.Api.Data;
using FinanceTracker.Api.Models;
using FinanceTracker.Api.Models.DTOs;

namespace FinanceTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ThemeController : ControllerBase
{
    private readonly IDbContextFactory<AppDbContext> _contextFactory;
    private readonly UserManager<User> _userManager;

    public ThemeController(IDbContextFactory<AppDbContext> contextFactory, UserManager<User> userManager)
    {
        _contextFactory = contextFactory;
        _userManager = userManager;
    }

    private async Task<bool> IsAdminUserAsync()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(userIdStr, out var userId))
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user != null)
            {
                if (await _userManager.IsInRoleAsync(user, "Admin") || 
                    User.IsInRole("Admin") || 
                    (user.Email != null && user.Email.ToLower().Contains("admin")))
                {
                    return true;
                }
            }
        }
        return User.IsInRole("Admin");
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<ThemeSettingsDto>> GetTheme()
    {
        await using var context = await _contextFactory.CreateDbContextAsync();
        var settings = await context.ThemeSettings.FirstOrDefaultAsync(s => s.Id == 1);

        if (settings == null)
        {
            settings = new SystemThemeSettings { Id = 1 };
            context.ThemeSettings.Add(settings);
            await context.SaveChangesAsync();
        }

        return Ok(MapToDto(settings));
    }

    [HttpPut]
    [Authorize]
    public async Task<ActionResult<ThemeSettingsDto>> UpdateTheme([FromBody] ThemeSettingsDto dto)
    {
        if (!await IsAdminUserAsync())
        {
            return Forbid();
        }

        await using var context = await _contextFactory.CreateDbContextAsync();
        var settings = await context.ThemeSettings.FirstOrDefaultAsync(s => s.Id == 1);

        if (settings == null)
        {
            settings = new SystemThemeSettings { Id = 1 };
            context.ThemeSettings.Add(settings);
        }

        // Dark Mode
        settings.DarkPageBg = dto.DarkPageBg;
        settings.DarkCardBg = dto.DarkCardBg;
        settings.DarkSurfaceBg = dto.DarkSurfaceBg;
        settings.DarkBorderColor = dto.DarkBorderColor;
        settings.DarkTextPrimary = dto.DarkTextPrimary;
        settings.DarkTextSecondary = dto.DarkTextSecondary;
        settings.DarkTextMuted = dto.DarkTextMuted;

        // Light Mode
        settings.LightPageBg = dto.LightPageBg;
        settings.LightCardBg = dto.LightCardBg;
        settings.LightSurfaceBg = dto.LightSurfaceBg;
        settings.LightBorderColor = dto.LightBorderColor;
        settings.LightTextPrimary = dto.LightTextPrimary;
        settings.LightTextSecondary = dto.LightTextSecondary;
        settings.LightTextMuted = dto.LightTextMuted;

        // Accents
        settings.PrimaryColor = dto.PrimaryColor;
        settings.IncomeColor = dto.IncomeColor;
        settings.ExpenseColor = dto.ExpenseColor;

        await context.SaveChangesAsync();
        return Ok(MapToDto(settings));
    }

    [HttpPost("reset")]
    [Authorize]
    public async Task<ActionResult<ThemeSettingsDto>> ResetTheme()
    {
        if (!await IsAdminUserAsync())
        {
            return Forbid();
        }

        await using var context = await _contextFactory.CreateDbContextAsync();
        var settings = await context.ThemeSettings.FirstOrDefaultAsync(s => s.Id == 1);

        var defaults = new SystemThemeSettings { Id = 1 };

        if (settings == null)
        {
            context.ThemeSettings.Add(defaults);
        }
        else
        {
            settings.DarkPageBg = defaults.DarkPageBg;
            settings.DarkCardBg = defaults.DarkCardBg;
            settings.DarkSurfaceBg = defaults.DarkSurfaceBg;
            settings.DarkBorderColor = defaults.DarkBorderColor;
            settings.DarkTextPrimary = defaults.DarkTextPrimary;
            settings.DarkTextSecondary = defaults.DarkTextSecondary;
            settings.DarkTextMuted = defaults.DarkTextMuted;

            settings.LightPageBg = defaults.LightPageBg;
            settings.LightCardBg = defaults.LightCardBg;
            settings.LightSurfaceBg = defaults.LightSurfaceBg;
            settings.LightBorderColor = defaults.LightBorderColor;
            settings.LightTextPrimary = defaults.LightTextPrimary;
            settings.LightTextSecondary = defaults.LightTextSecondary;
            settings.LightTextMuted = defaults.LightTextMuted;

            settings.PrimaryColor = defaults.PrimaryColor;
            settings.IncomeColor = defaults.IncomeColor;
            settings.ExpenseColor = defaults.ExpenseColor;
        }

        await context.SaveChangesAsync();
        return Ok(MapToDto(defaults));
    }

    private static ThemeSettingsDto MapToDto(SystemThemeSettings s)
    {
        return new ThemeSettingsDto
        {
            DarkPageBg = s.DarkPageBg,
            DarkCardBg = s.DarkCardBg,
            DarkSurfaceBg = s.DarkSurfaceBg,
            DarkBorderColor = s.DarkBorderColor,
            DarkTextPrimary = s.DarkTextPrimary,
            DarkTextSecondary = s.DarkTextSecondary,
            DarkTextMuted = s.DarkTextMuted,

            LightPageBg = s.LightPageBg,
            LightCardBg = s.LightCardBg,
            LightSurfaceBg = s.LightSurfaceBg,
            LightBorderColor = s.LightBorderColor,
            LightTextPrimary = s.LightTextPrimary,
            LightTextSecondary = s.LightTextSecondary,
            LightTextMuted = s.LightTextMuted,

            PrimaryColor = s.PrimaryColor,
            IncomeColor = s.IncomeColor,
            ExpenseColor = s.ExpenseColor
        };
    }
}
