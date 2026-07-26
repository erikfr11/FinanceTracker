using System;
using FinanceTracker.Api.Models.Enums;

namespace FinanceTracker.Api.Models
{
    public class Account
    {
        public Guid Id { get; set; }
        public Guid BankId { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public AccountType Type { get; set; }
        
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Bank? Bank { get; set; }
        public User? User { get; set; }
        public ICollection<AccountBalance> Balances { get; set; } = new List<AccountBalance>();
    }
}
