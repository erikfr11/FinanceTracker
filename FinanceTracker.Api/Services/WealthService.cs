using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FinanceTracker.Api.Data;
using FinanceTracker.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Api.Services
{
    public interface IWealthService
    {
        // Banks
        Task<List<Bank>> GetBanksAsync(Guid userId);
        Task<Bank> GetBankByIdAsync(Guid id, Guid userId);
        Task<Bank> CreateBankAsync(Bank bank);
        Task UpdateBankAsync(Bank bank);
        Task DeleteBankAsync(Guid id, Guid userId);

        // Accounts
        Task<List<Account>> GetAccountsByBankAsync(Guid bankId, Guid userId);
        Task<List<Account>> GetAllAccountsAsync(Guid userId);
        Task<Account> GetAccountByIdAsync(Guid id, Guid userId);
        Task<Account> CreateAccountAsync(Account account);
        Task UpdateAccountAsync(Account account);
        Task DeleteAccountAsync(Guid id, Guid userId);

        // Account Balances
        Task<AccountBalance> AddBalanceAsync(Guid accountId, Guid userId, decimal amount, DateTime date);
        Task DeleteBalanceAsync(Guid balanceId, Guid userId);
        Task<List<AccountBalance>> GetBalancesAsync(Guid accountId, Guid userId);
    }

    public class WealthService : IWealthService
    {
        private readonly IDbContextFactory<AppDbContext> _contextFactory;

        public WealthService(IDbContextFactory<AppDbContext> contextFactory)
        {
            _contextFactory = contextFactory;
        }

        // --- Banks ---
        public async Task<List<Bank>> GetBanksAsync(Guid userId)
        {
            using var _context = await _contextFactory.CreateDbContextAsync();
            return await _context.Banks
                .Where(b => b.UserId == userId)
                .OrderBy(b => b.Name)
                .ToListAsync();
        }

        public async Task<Bank> GetBankByIdAsync(Guid id, Guid userId)
        {
            using var _context = await _contextFactory.CreateDbContextAsync();
            return await _context.Banks
                .Include(b => b.Accounts)
                    .ThenInclude(a => a.Balances)
                .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
        }

        public async Task<Bank> CreateBankAsync(Bank bank)
        {
            using var _context = await _contextFactory.CreateDbContextAsync();
            bank.Id = Guid.NewGuid();
            bank.CreatedAtUtc = DateTime.UtcNow;
            _context.Banks.Add(bank);
            await _context.SaveChangesAsync();
            return bank;
        }

        public async Task UpdateBankAsync(Bank bank)
        {
            using var _context = await _contextFactory.CreateDbContextAsync();
            var existing = await _context.Banks.FirstOrDefaultAsync(b => b.Id == bank.Id && b.UserId == bank.UserId);
            if (existing == null) throw new UnauthorizedAccessException("Bank not found or access denied.");
            
            existing.Name = bank.Name;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteBankAsync(Guid id, Guid userId)
        {
            using var _context = await _contextFactory.CreateDbContextAsync();
            var bank = await _context.Banks.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
            if (bank != null)
            {
                _context.Banks.Remove(bank);
                await _context.SaveChangesAsync();
            }
        }

        // --- Accounts ---
        public async Task<List<Account>> GetAccountsByBankAsync(Guid bankId, Guid userId)
        {
            using var _context = await _contextFactory.CreateDbContextAsync();
            return await _context.Accounts
                .Include(a => a.Balances.OrderByDescending(b => b.Date))
                .Where(a => a.BankId == bankId && a.UserId == userId)
                .OrderBy(a => a.Name)
                .ToListAsync();
        }

        public async Task<List<Account>> GetAllAccountsAsync(Guid userId)
        {
            using var _context = await _contextFactory.CreateDbContextAsync();
            return await _context.Accounts
                .Include(a => a.Bank)
                .Include(a => a.Balances.OrderByDescending(b => b.Date))
                .Where(a => a.UserId == userId)
                .OrderBy(a => a.Bank.Name).ThenBy(a => a.Name)
                .ToListAsync();
        }

        public async Task<Account> GetAccountByIdAsync(Guid id, Guid userId)
        {
            using var _context = await _contextFactory.CreateDbContextAsync();
            return await _context.Accounts
                .Include(a => a.Bank)
                .Include(a => a.Balances.OrderByDescending(b => b.Date))
                .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
        }

        public async Task<Account> CreateAccountAsync(Account account)
        {
            using var _context = await _contextFactory.CreateDbContextAsync();
            var bank = await _context.Banks.FirstOrDefaultAsync(b => b.Id == account.BankId && b.UserId == account.UserId);
            if (bank == null) throw new UnauthorizedAccessException("Bank not found or access denied.");

            account.Id = Guid.NewGuid();
            account.CreatedAtUtc = DateTime.UtcNow;
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();
            return account;
        }

        public async Task UpdateAccountAsync(Account account)
        {
            using var _context = await _contextFactory.CreateDbContextAsync();
            var existing = await _context.Accounts.FirstOrDefaultAsync(a => a.Id == account.Id && a.UserId == account.UserId);
            if (existing == null) throw new UnauthorizedAccessException("Account not found or access denied.");

            existing.Name = account.Name;
            existing.Type = account.Type;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAccountAsync(Guid id, Guid userId)
        {
            using var _context = await _contextFactory.CreateDbContextAsync();
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
            if (account != null)
            {
                _context.Accounts.Remove(account);
                await _context.SaveChangesAsync();
            }
        }

        // --- Balances ---
        public async Task<AccountBalance> AddBalanceAsync(Guid accountId, Guid userId, decimal amount, DateTime date)
        {
            using var _context = await _contextFactory.CreateDbContextAsync();
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Id == accountId && a.UserId == userId);
            if (account == null) throw new UnauthorizedAccessException("Account not found or access denied.");

            // Overwrite existing balance for the same day if it exists
            var existingBalance = await _context.AccountBalances
                .FirstOrDefaultAsync(b => b.AccountId == accountId && b.Date.Date == date.Date);

            if (existingBalance != null)
            {
                existingBalance.Amount = amount;
                await _context.SaveChangesAsync();
                return existingBalance;
            }

            var balance = new AccountBalance
            {
                Id = Guid.NewGuid(),
                AccountId = accountId,
                Date = date.Date,
                Amount = amount,
                CreatedAtUtc = DateTime.UtcNow
            };

            _context.AccountBalances.Add(balance);
            await _context.SaveChangesAsync();
            return balance;
        }

        public async Task DeleteBalanceAsync(Guid balanceId, Guid userId)
        {
            using var _context = await _contextFactory.CreateDbContextAsync();
            var balance = await _context.AccountBalances
                .Include(b => b.Account)
                .FirstOrDefaultAsync(b => b.Id == balanceId && b.Account.UserId == userId);
            
            if (balance != null)
            {
                _context.AccountBalances.Remove(balance);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<AccountBalance>> GetBalancesAsync(Guid accountId, Guid userId)
        {
            using var _context = await _contextFactory.CreateDbContextAsync();
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Id == accountId && a.UserId == userId);
            if (account == null) throw new UnauthorizedAccessException("Account not found or access denied.");

            return await _context.AccountBalances
                .Where(b => b.AccountId == accountId)
                .OrderByDescending(b => b.Date)
                .ToListAsync();
        }
    }
}
