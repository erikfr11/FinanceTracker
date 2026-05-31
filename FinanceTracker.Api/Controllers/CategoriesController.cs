using System.Security.Claims;
using FinanceTracker.Api.Models.DTOs;
using FinanceTracker.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTracker.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    private Guid GetUserId()
    {
        var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(idStr, out var id)) return id;
        throw new UnauthorizedAccessException("Invalid authentication token.");
    }

    private bool IsAdmin()
    {
        return User.IsInRole("Admin");
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryResponseDto>>> GetAllVisible()
    {
        var userId = GetUserId();
        var categories = await _categoryService.GetVisibleCategoriesAsync(userId);
        return Ok(categories);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryResponseDto>> GetById(int id)
    {
        var userId = GetUserId();
        var category = await _categoryService.GetByIdAsync(id, userId);
        
        if (category == null) return NotFound();
        return Ok(category);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryResponseDto>> Create(CategoryCreateDto dto)
    {
        var userId = GetUserId();
        var isAdmin = IsAdmin();
        
        var created = await _categoryService.AddAsync(userId, isAdmin, dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<IEnumerable<CategoryResponseDto>>> CreateBulk(IEnumerable<CategoryCreateDto> dtos)
    {
        var userId = GetUserId();
        var isAdmin = IsAdmin();

        var created = await _categoryService.AddBulkAsync(userId, isAdmin, dtos);
        return Ok(created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, CategoryUpdateDto dto)
    {
        if (id != dto.Id) return BadRequest("ID mismatch.");

        var userId = GetUserId();
        var isAdmin = IsAdmin();

        try
        {
            await _categoryService.UpdateAsync(userId, isAdmin, dto);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();
        var isAdmin = IsAdmin();

        try
        {
            await _categoryService.DeleteAsync(id, userId, isAdmin);
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    [HttpDelete("bulk")]
    public async Task<IActionResult> DeleteBulk([FromQuery] IEnumerable<int> ids)
    {
        var userId = GetUserId();
        var isAdmin = IsAdmin();

        try
        {
            await _categoryService.DeleteBulkAsync(ids, userId, isAdmin);
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }
}
