using System;
using System.Collections.Generic;
using FinanceTracker.Api.Models.Enums;

namespace FinanceTracker.Api.Models.DTOs
{
    public class BankDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int AccountCount { get; set; }
        public decimal TotalBalance { get; set; }
        public int SortOrder { get; set; }
    }

    public class BankCreateUpdateDto
    {
        public string Name { get; set; } = string.Empty;
    }

    public class BankReorderDto
    {
        public Guid Id { get; set; }
        public int SortOrder { get; set; }
    }

    public class AccountDto
    {
        public Guid Id { get; set; }
        public Guid BankId { get; set; }
        public string BankName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public decimal CurrentBalance { get; set; }
        public DateTime? LastBalanceDate { get; set; }
        public List<AccountBalanceDto> History { get; set; } = new();
    }

    public class AccountCreateDto
    {
        public Guid BankId { get; set; }
        public string Name { get; set; } = string.Empty;
        public AccountType Type { get; set; }
    }

    public class AccountUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public AccountType Type { get; set; }
    }

    public class AccountBalanceDto
    {
        public Guid Id { get; set; }
        public DateTime Date { get; set; }
        public decimal Amount { get; set; }
        public decimal? Value { get; set; }
        public decimal? Factor { get; set; }
    }

    public class AccountBalanceCreateDto
    {
        public DateTime Date { get; set; }
        public decimal Amount { get; set; }
        public decimal? Value { get; set; }
        public decimal? Factor { get; set; }
    }
}
