using System.Security.Claims;
using FinanceTracker.Api.Models.DTOs;
using FinanceTracker.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTracker.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class FixedCostsController : ControllerBase
{
    private readonly IFixedCostService _fixedCostService;

    public FixedCostsController(IFixedCostService fixedCostService)
    {
        _fixedCostService = fixedCostService;
    }

    private Guid GetUserId()
    {
        var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(idStr, out var id)) return id;
        throw new UnauthorizedAccessException("Invalid authentication token.");
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FixedCostResponseDto>>> GetAll()
    {
        var userId = GetUserId();
        var fixedCosts = await _fixedCostService.GetByUserIdAsync(userId);
        return Ok(fixedCosts);
    }

    [HttpGet("{id:guid}", Name = "GetFixedCostById")]
    public async Task<ActionResult<FixedCostResponseDto>> GetById(Guid id)
    {
        var userId = GetUserId();
        var fixedCost = await _fixedCostService.GetByIdAsync(id, userId);
        if (fixedCost == null) return NotFound();
        return Ok(fixedCost);
    }

    [HttpPost]
    public async Task<ActionResult<FixedCostResponseDto>> Create([FromBody] FixedCostCreateDto dto)
    {
        var userId = GetUserId();
        try
        {
            var created = await _fixedCostService.AddAsync(userId, dto);
            // Instantly check/process due status after creation
            await _fixedCostService.ProcessDueFixedCostsAsync();
            return CreatedAtRoute("GetFixedCostById", new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { detail = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { detail = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] FixedCostUpdateDto dto)
    {
        if (id != dto.Id) return BadRequest("ID mismatch.");

        var userId = GetUserId();
        try
        {
            await _fixedCostService.UpdateAsync(userId, dto);
            await _fixedCostService.ProcessDueFixedCostsAsync();
            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            return BadRequest(new { detail = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetUserId();
        try
        {
            await _fixedCostService.DeleteAsync(id, userId);
            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpPost("process-now")]
    public async Task<ActionResult> ProcessNow()
    {
        var generatedCount = await _fixedCostService.ProcessDueFixedCostsAsync();
        return Ok(new { message = $"Verarbeitung abgeschlossen. {generatedCount} Transaktion(en) wurden neu erzeugt." });
    }
}
