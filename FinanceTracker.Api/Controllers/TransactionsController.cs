using System.Security.Claims;
using FinanceTracker.Api.Models.DTOs;
using FinanceTracker.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTracker.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _transactionService;

    public TransactionsController(ITransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    private Guid GetUserId()
    {
        var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(idStr, out var id)) return id;
        throw new UnauthorizedAccessException("Invalid authentication token.");
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TransactionResponseDto>>> GetAll([FromQuery] TransactionFilterDto filter)
    {
        var userId = GetUserId();
        var transactions = await _transactionService.GetTransactionsAsync(userId, filter);
        return Ok(transactions);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TransactionResponseDto>> GetById(Guid id)
    {
        var userId = GetUserId();
        var transaction = await _transactionService.GetByIdAsync(id, userId);
        if (transaction == null) return NotFound();
        return Ok(transaction);
    }

    [HttpPost]
    public async Task<ActionResult<TransactionResponseDto>> Create(TransactionCreateDto dto)
    {
        var userId = GetUserId();
        var created = await _transactionService.AddAsync(userId, dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<IEnumerable<TransactionResponseDto>>> CreateBulk(IEnumerable<TransactionCreateDto> dtos)
    {
        var userId = GetUserId();
        var created = await _transactionService.AddBulkAsync(userId, dtos);
        return Ok(created);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, TransactionUpdateDto dto)
    {
        if (id != dto.Id) return BadRequest("ID mismatch.");

        var userId = GetUserId();
        try
        {
            await _transactionService.UpdateAsync(userId, dto);
            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetUserId();
        try
        {
            await _transactionService.DeleteAsync(id, userId);
            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpDelete("bulk")]
    public async Task<IActionResult> DeleteBulk([FromQuery] TransactionFilterDto filter)
    {
        var userId = GetUserId();
        await _transactionService.DeleteBulkAsync(userId, filter);
        return NoContent();
    }

    [HttpGet("export")]
    public async Task<IActionResult> Export([FromQuery] TransactionFilterDto filter, [FromQuery] string format = "csv")
    {
        var userId = GetUserId();
        try
        {
            var fileBytes = await _transactionService.ExportAsync(userId, filter, format);
            var providers = HttpContext.RequestServices.GetServices<ITransactionFormatProvider>();
            var provider = providers.FirstOrDefault(p => p.FormatName == format.ToLowerInvariant());

            var contentType = provider?.ContentType ?? "application/octet-stream";
            var extension = provider?.FileExtension ?? ".txt";
            
            return File(fileBytes, contentType, $"transactions_export_{DateTime.Now:yyyyMMdd}{extension}");
        }
        catch (NotSupportedException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("import")]
    public async Task<IActionResult> Import(IFormFile file, [FromQuery] string format = "csv")
    {
        if (file == null || file.Length == 0) return BadRequest("No file uploaded.");

        var userId = GetUserId();
        try
        {
            using var stream = file.OpenReadStream();
            var imported = await _transactionService.ImportAsync(userId, stream, format);
            return Ok(new { message = $"Successfully imported {imported.Count()} transactions." });
        }
        catch (NotSupportedException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest($"Import failed: {ex.Message}");
        }
    }
}
