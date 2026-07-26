using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using FinanceTracker.Api.Models;
using FinanceTracker.Api.Models.DTOs;
using FinanceTracker.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTracker.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class WealthController : ControllerBase
    {
        private readonly IWealthService _wealthService;

        public WealthController(IWealthService wealthService)
        {
            _wealthService = wealthService;
        }

        private Guid GetUserId()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                throw new UnauthorizedAccessException();
            return userId;
        }

        // --- Banks ---
        
        [HttpGet("banks")]
        public async Task<IActionResult> GetBanks()
        {
            var userId = GetUserId();
            var banks = await _wealthService.GetBanksAsync(userId);
            var accounts = await _wealthService.GetAllAccountsAsync(userId);

            var bankDtos = banks.Select(b => {
                var bankAccounts = accounts.Where(a => a.BankId == b.Id).ToList();
                var totalBalance = bankAccounts.Sum(a => a.Balances.OrderByDescending(bal => bal.Date).FirstOrDefault()?.Amount ?? 0);
                return new BankDto
                {
                    Id = b.Id,
                    Name = b.Name,
                    AccountCount = bankAccounts.Count,
                    TotalBalance = totalBalance
                };
            }).ToList();

            return Ok(bankDtos);
        }

        [HttpGet("banks/{id}")]
        public async Task<IActionResult> GetBank(Guid id)
        {
            var userId = GetUserId();
            var bank = await _wealthService.GetBankByIdAsync(id, userId);
            if (bank == null) return NotFound();

            var totalBalance = bank.Accounts.Sum(a => a.Balances.OrderByDescending(b => b.Date).FirstOrDefault()?.Amount ?? 0);

            return Ok(new BankDto
            {
                Id = bank.Id,
                Name = bank.Name,
                AccountCount = bank.Accounts.Count,
                TotalBalance = totalBalance
            });
        }

        [HttpPost("banks")]
        public async Task<IActionResult> CreateBank([FromBody] BankCreateUpdateDto dto)
        {
            var userId = GetUserId();
            var bank = new Bank { Name = dto.Name, UserId = userId };
            await _wealthService.CreateBankAsync(bank);
            return Ok(new BankDto { Id = bank.Id, Name = bank.Name });
        }

        [HttpPut("banks/{id}")]
        public async Task<IActionResult> UpdateBank(Guid id, [FromBody] BankCreateUpdateDto dto)
        {
            var userId = GetUserId();
            var bank = new Bank { Id = id, UserId = userId, Name = dto.Name };
            await _wealthService.UpdateBankAsync(bank);
            return NoContent();
        }

        [HttpDelete("banks/{id}")]
        public async Task<IActionResult> DeleteBank(Guid id)
        {
            var userId = GetUserId();
            await _wealthService.DeleteBankAsync(id, userId);
            return NoContent();
        }

        // --- Accounts ---
        
        [HttpGet("accounts")]
        public async Task<IActionResult> GetAllAccounts()
        {
            var userId = GetUserId();
            var accounts = await _wealthService.GetAllAccountsAsync(userId);

            var dtos = accounts.Select(a => MapToAccountDto(a)).ToList();
            return Ok(dtos);
        }

        [HttpGet("banks/{bankId}/accounts")]
        public async Task<IActionResult> GetAccountsByBank(Guid bankId)
        {
            var userId = GetUserId();
            var accounts = await _wealthService.GetAccountsByBankAsync(bankId, userId);
            var dtos = accounts.Select(a => MapToAccountDto(a)).ToList();
            return Ok(dtos);
        }

        [HttpPost("accounts")]
        public async Task<IActionResult> CreateAccount([FromBody] AccountCreateDto dto)
        {
            var userId = GetUserId();
            var account = new Account
            {
                BankId = dto.BankId,
                Name = dto.Name,
                Type = dto.Type,
                UserId = userId
            };
            
            var created = await _wealthService.CreateAccountAsync(account);
            // Reload to get Bank Name etc if needed, but we can just return a basic DTO
            return Ok(MapToAccountDto(created));
        }

        [HttpPut("accounts/{id}")]
        public async Task<IActionResult> UpdateAccount(Guid id, [FromBody] AccountUpdateDto dto)
        {
            var userId = GetUserId();
            var account = new Account
            {
                Id = id,
                UserId = userId,
                Name = dto.Name,
                Type = dto.Type
            };
            await _wealthService.UpdateAccountAsync(account);
            return NoContent();
        }

        [HttpDelete("accounts/{id}")]
        public async Task<IActionResult> DeleteAccount(Guid id)
        {
            var userId = GetUserId();
            await _wealthService.DeleteAccountAsync(id, userId);
            return NoContent();
        }

        // --- Balances ---

        [HttpPost("accounts/{accountId}/balances")]
        public async Task<IActionResult> AddBalance(Guid accountId, [FromBody] AccountBalanceCreateDto dto)
        {
            var userId = GetUserId();
            var balance = await _wealthService.AddBalanceAsync(accountId, userId, dto.Amount, dto.Date);
            return Ok(new AccountBalanceDto { Id = balance.Id, Date = balance.Date, Amount = balance.Amount });
        }

        [HttpDelete("balances/{id}")]
        public async Task<IActionResult> DeleteBalance(Guid id)
        {
            var userId = GetUserId();
            await _wealthService.DeleteBalanceAsync(id, userId);
            return NoContent();
        }

        private static AccountDto MapToAccountDto(Account a)
        {
            var latestBalance = a.Balances.OrderByDescending(b => b.Date).FirstOrDefault();
            return new AccountDto
            {
                Id = a.Id,
                BankId = a.BankId,
                BankName = a.Bank?.Name ?? "",
                Name = a.Name,
                Type = a.Type.ToString(),
                CurrentBalance = latestBalance?.Amount ?? 0,
                LastBalanceDate = latestBalance?.Date,
                History = a.Balances.OrderBy(b => b.Date).Select(b => new AccountBalanceDto
                {
                    Id = b.Id,
                    Date = b.Date,
                    Amount = b.Amount
                }).ToList()
            };
        }
    }
}
