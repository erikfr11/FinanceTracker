using System;

namespace FinanceTracker.Api.Models
{
    public class AccountBalance
    {
        public Guid Id { get; set; }
        public Guid AccountId { get; set; }
        public DateTime Date { get; set; }
        public decimal Amount { get; set; }
        
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

        // Navigation property
        public Account? Account { get; set; }
    }
}
