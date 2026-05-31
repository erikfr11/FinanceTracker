using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using FinanceTracker.Api.Data;
using FinanceTracker.Api.Models;

var builder = WebApplication.CreateBuilder(args);

// ── Database ────────────────────────────────────────────────────────
builder.Services.AddDbContextFactory<AppDbContext>(options =>
{
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"));

    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();   // SQL mit Parameterwerten loggen
        options.EnableDetailedErrors();
    }
});

// ── ASP.NET Core Identity ───────────────────────────────────────────
builder.Services.AddIdentity<User, IdentityRole<Guid>>(options =>
{
    // Password policy
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;

    // User settings
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// ── API / Controllers & Singletons ──────────────────────────────────
builder.Services.AddSingleton<FinanceTracker.Api.Models.Interfaces.IFinanceModelFactory, FinanceTracker.Api.Models.Factories.FinanceModelFactory>();

// ── API / Infrastruktur (DAO Singleton Factory) ─────────────────────
builder.Services.AddSingleton<FinanceTracker.Api.DAOs.Factories.IDaoFactory, FinanceTracker.Api.DAOs.Factories.DaoFactory>();

// ── API / Domain (Repository Singleton Factory) ─────────────────────
builder.Services.AddSingleton<FinanceTracker.Api.Repositories.Factories.IRepositoryFactory, FinanceTracker.Api.Repositories.Factories.RepositoryFactory>();

// ── App Services & format providers ─────────────────────────────────
builder.Services.AddSingleton<FinanceTracker.Api.Services.Interfaces.ITransactionFormatProvider, FinanceTracker.Api.Services.FormatProviders.JsonTransactionProvider>();
builder.Services.AddSingleton<FinanceTracker.Api.Services.Interfaces.ITransactionFormatProvider, FinanceTracker.Api.Services.FormatProviders.CsvTransactionProvider>();
builder.Services.AddSingleton<FinanceTracker.Api.Services.Interfaces.ITransactionFormatProvider, FinanceTracker.Api.Services.FormatProviders.ExcelTransactionProvider>();
builder.Services.AddSingleton<FinanceTracker.Api.Services.Interfaces.ITransactionService, FinanceTracker.Api.Services.TransactionService>();
builder.Services.AddSingleton<FinanceTracker.Api.Services.Interfaces.ICategoryService, FinanceTracker.Api.Services.CategoryService>();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// ── Middleware pipeline ─────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
