using FinanceTracker.Api.Services.Interfaces;

namespace FinanceTracker.Api.Services;

/// <summary>
/// Hosted background service that processes due fixed cost rules:
/// - Runs automatically once upon application startup.
/// - Runs periodically once every 24 hours while the application is active.
/// </summary>
public class FixedCostBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<FixedCostBackgroundService> _logger;

    public FixedCostBackgroundService(IServiceProvider serviceProvider, ILogger<FixedCostBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("FixedCostBackgroundService started.");

        // 1. Check immediately on startup
        await ProcessFixedCostsSafelyAsync();

        // 2. Periodic loop every 24 hours
        using var timer = new PeriodicTimer(TimeSpan.FromHours(24));
        while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
        {
            await ProcessFixedCostsSafelyAsync();
        }
    }

    private async Task ProcessFixedCostsSafelyAsync()
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var fixedCostService = scope.ServiceProvider.GetRequiredService<IFixedCostService>();
            
            var generatedCount = await fixedCostService.ProcessDueFixedCostsAsync();
            if (generatedCount > 0)
            {
                _logger.LogInformation("FixedCostBackgroundService: Successfully generated {Count} due fixed cost transactions.", generatedCount);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while processing due fixed costs in background service.");
        }
    }
}
