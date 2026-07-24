using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using FinanceTracker.Api.Models;
using FinanceTracker.Api.Models.Enums;

namespace FinanceTracker.Api.Data;

/// <summary>
/// Application database context extending IdentityDbContext for ASP.NET Core Identity.
/// User/Role use Guid keys. Category uses int keys. Configured for PostgreSQL.
/// </summary>
public class AppDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<SystemThemeSettings> ThemeSettings => Set<SystemThemeSettings>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // ── User Configuration ──────────────────────────────────────

        builder.Entity<User>(entity =>
        {
            entity.Property(u => u.FirstName)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(u => u.LastName)
                .HasMaxLength(100)
                .IsRequired();

            // One-to-Many: User → Transactions
            entity.HasMany(u => u.Transactions)
                .WithOne(t => t.User)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Category Configuration ──────────────────────────────────

        builder.Entity<Category>(entity =>
        {
            entity.HasKey(c => c.Id);

            entity.Property(c => c.Name)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(c => c.Type)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();

            entity.Property(c => c.ExpenseType)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();

            entity.Property(c => c.IsSystemCategory)
                .HasDefaultValue(false);

            // One-to-Many: Category → Transactions
            entity.HasMany(c => c.Transactions)
                .WithOne(t => t.Category)
                .HasForeignKey(t => t.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Transaction Configuration ───────────────────────────────

        builder.Entity<Transaction>(entity =>
        {
            entity.HasKey(t => t.Id);

            // Auto-generate Guid on insert
            entity.Property(t => t.Id)
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(t => t.Amount)
                .HasColumnType("numeric(18,2)")
                .IsRequired();

            entity.Property(t => t.Date)
                .IsRequired();

            entity.Property(t => t.Note)
                .HasMaxLength(500);
        });

        // ── Seed System Categories ──────────────────────────────────

        builder.Entity<Category>().HasData(
            // Income (ExpenseType = None)
            new Category { Id = 1, Name = "Gehalt",          Type = CategoryType.Income,  ExpenseType = ExpenseType.None,     IsSystemCategory = true },
            new Category { Id = 2, Name = "Freiberuflich",   Type = CategoryType.Income,  ExpenseType = ExpenseType.None,     IsSystemCategory = true },
            new Category { Id = 3, Name = "Investitionen",   Type = CategoryType.Income,  ExpenseType = ExpenseType.None,     IsSystemCategory = true },

            // Fixed Expenses
            new Category { Id = 4, Name = "Miete",           Type = CategoryType.Expense, ExpenseType = ExpenseType.Fixed,    IsSystemCategory = true },
            new Category { Id = 5, Name = "Versicherungen",  Type = CategoryType.Expense, ExpenseType = ExpenseType.Fixed,    IsSystemCategory = true },
            new Category { Id = 6, Name = "Abonnements",     Type = CategoryType.Expense, ExpenseType = ExpenseType.Fixed,    IsSystemCategory = true },

            // Variable Expenses
            new Category { Id = 7, Name = "Lebensmittel",    Type = CategoryType.Expense, ExpenseType = ExpenseType.Variable, IsSystemCategory = true },
            new Category { Id = 8, Name = "Transport",       Type = CategoryType.Expense, ExpenseType = ExpenseType.Variable, IsSystemCategory = true },
            new Category { Id = 9, Name = "Unterhaltung",    Type = CategoryType.Expense, ExpenseType = ExpenseType.Variable, IsSystemCategory = true },
            new Category { Id = 10, Name = "Sonstiges",      Type = CategoryType.Expense, ExpenseType = ExpenseType.Variable, IsSystemCategory = true }
        );

        // ── Seed System Theme Settings ──────────────────────────────
        builder.Entity<SystemThemeSettings>().HasData(
            new SystemThemeSettings
            {
                Id = 1,
                DarkPageBg = "#020617",
                DarkCardBg = "#0f172a",
                DarkSurfaceBg = "#1e293b",
                DarkBorderColor = "#334155",
                DarkTextPrimary = "#f1f5f9",
                DarkTextSecondary = "#cbd5e1",
                DarkTextMuted = "#94a3b8",
                LightPageBg = "#f8fafc",
                LightCardBg = "#ffffff",
                LightSurfaceBg = "#f1f5f9",
                LightBorderColor = "#e2e8f0",
                LightTextPrimary = "#0f172a",
                LightTextSecondary = "#475569",
                LightTextMuted = "#64748b",
                PrimaryColor = "#2563eb",
                IncomeColor = "#10b981",
                ExpenseColor = "#ef4444"
            }
        );
    }
}
