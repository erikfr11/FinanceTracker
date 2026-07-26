using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using FinanceTracker.Api.Data;
using FinanceTracker.Api.Models;

// Enable legacy timestamp behavior for Npgsql / PostgreSQL DateTime handling
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// ── Database ────────────────────────────────────────────────────────
builder.Services.AddDbContextFactory<AppDbContext>(options =>
{
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"));

    options.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));

    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();   // SQL mit Parameterwerten loggen
        options.EnableDetailedErrors();
    }
});

// ── ASP.NET Core Identity ───────────────────────────────────────────
builder.Services.AddIdentityApiEndpoints<User>(options =>
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
.AddRoles<IdentityRole<Guid>>()
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
builder.Services.AddSingleton<FinanceTracker.Api.Services.Interfaces.IFixedCostService, FinanceTracker.Api.Services.FixedCostService>();
builder.Services.AddSingleton<FinanceTracker.Api.Services.IWealthService, FinanceTracker.Api.Services.WealthService>();
builder.Services.AddHostedService<FinanceTracker.Api.Services.FixedCostBackgroundService>();

// ── CORS Configuration ──────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevelopmentCors", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddOpenApi();

var app = builder.Build();

// ── Database Seeding ────────────────────────────────────────────────
await DbInitializer.SeedAsync(app);

// ── Middleware pipeline ─────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("DevelopmentCors");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapIdentityApi<User>();

app.Run();
