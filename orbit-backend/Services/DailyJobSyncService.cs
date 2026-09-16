using Microsoft.Extensions.Options;

namespace Orbit.Api.Services;

public class JobSyncOptions
{
    public const string SectionName = "JobSync";

    /// <summary>Hours between automatic scrapes. Default is 24.</summary>
    public int IntervalHours { get; set; } = 24;

    /// <summary>Run a scrape immediately when the API starts.</summary>
    public bool SyncOnStartup { get; set; } = true;
}

public sealed class JobSyncStatus
{
    public DateTimeOffset? LastStartedAt { get; set; }
    public DateTimeOffset? LastSucceededAt { get; set; }
    public int LastAdded { get; set; }
    public string? LastError { get; set; }
}

public class DailyJobSyncService(
    IServiceScopeFactory scopes,
    IOptions<JobSyncOptions> options,
    JobSyncStatus status,
    ILogger<DailyJobSyncService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalHours = Math.Max(1, options.Value.IntervalHours);
        var interval = TimeSpan.FromHours(intervalHours);

        if (options.Value.SyncOnStartup)
        {
            await RunSyncAsync(stoppingToken);
        }

        using var timer = new PeriodicTimer(interval);
        logger.LogInformation("Daily job scrape scheduled every {Hours} hour(s).", intervalHours);

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await RunSyncAsync(stoppingToken);
        }
    }

    private async Task RunSyncAsync(CancellationToken stoppingToken)
    {
        status.LastStartedAt = DateTimeOffset.UtcNow;
        try
        {
            using var scope = scopes.CreateScope();
            var sync = scope.ServiceProvider.GetRequiredService<JobSyncService>();
            var added = await sync.SyncAsync(stoppingToken);
            status.LastAdded = added;
            status.LastSucceededAt = DateTimeOffset.UtcNow;
            status.LastError = null;
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            status.LastError = ex.Message;
            logger.LogWarning(ex, "Scheduled job scrape failed.");
        }
    }
}
