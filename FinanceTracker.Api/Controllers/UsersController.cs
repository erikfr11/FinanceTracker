using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinanceTracker.Api.Models;

namespace FinanceTracker.Api.Controllers;

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string PreferredCurrency { get; set; } = "EUR";
    public bool IsPremiumUser { get; set; }
    public bool IsAdmin { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? LastLoginAtUtc { get; set; }
}

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly UserManager<User> _userManager;

    public UsersController(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserProfileDto>> GetCurrentUser()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return NotFound();
        }

        // Record last login timestamp
        user.LastLoginAtUtc = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        var isAdmin = await _userManager.IsInRoleAsync(user, "Admin");

        return Ok(new UserProfileDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            PreferredCurrency = user.PreferredCurrency,
            IsPremiumUser = user.IsPremiumUser,
            IsAdmin = isAdmin,
            CreatedAtUtc = user.CreatedAtUtc,
            LastLoginAtUtc = user.LastLoginAtUtc
        });
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<UserProfileDto>>> GetAllUsers()
    {
        var users = await _userManager.Users.ToListAsync();
        var dtos = new List<UserProfileDto>();

        foreach (var user in users)
        {
            var isAdmin = await _userManager.IsInRoleAsync(user, "Admin");
            dtos.Add(new UserProfileDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = user.FullName,
                PreferredCurrency = user.PreferredCurrency,
                IsPremiumUser = user.IsPremiumUser,
                IsAdmin = isAdmin,
                CreatedAtUtc = user.CreatedAtUtc,
                LastLoginAtUtc = user.LastLoginAtUtc
            });
        }

        return Ok(dtos.OrderByDescending(u => u.CreatedAtUtc));
    }
}
