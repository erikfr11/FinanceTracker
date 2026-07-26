using System;

namespace FinanceTracker.Api.Models
{
    public class Bank
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User? User { get; set; }
        public ICollection<Account> Accounts { get; set; } = new List<Account>();
    }
}
