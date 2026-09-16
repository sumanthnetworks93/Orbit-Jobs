using Microsoft.EntityFrameworkCore;
using Orbit.Api.Data;

namespace Orbit.Api.Services;

public class JobSyncService(
    OrbitDbContext db,
    ExternalJobSources sources,
    ILogger<JobSyncService> logger)
{
    public async Task<int> SyncAsync(CancellationToken cancellationToken = default)
    {
        var fetched = await sources.FetchAllAsync(cancellationToken);
        if (fetched.Count == 0)
        {
            logger.LogWarning("No jobs fetched from external sources.");
            return 0;
        }

        var fetchedKeys = fetched
            .Where(j => !string.IsNullOrWhiteSpace(j.ExternalKey))
            .Select(j => j.ExternalKey!)
            .ToHashSet(StringComparer.Ordinal);

        var existing = await db.Jobs
            .Where(j => j.ExternalKey != null && fetchedKeys.Contains(j.ExternalKey))
            .ToDictionaryAsync(j => j.ExternalKey!, cancellationToken);

        if (fetchedKeys.Count > 0)
        {
            var stale = await db.Jobs
                .Where(j => j.ExternalKey != null && !fetchedKeys.Contains(j.ExternalKey))
                .ToListAsync(cancellationToken);

            if (stale.Count > 0)
            {
                db.Jobs.RemoveRange(stale);
            }
        }

        var added = 0;

        foreach (var job in fetched)
        {
            if (string.IsNullOrWhiteSpace(job.ExternalKey))
            {
                continue;
            }

            if (existing.TryGetValue(job.ExternalKey, out var current))
            {
                current.Title = job.Title;
                current.Company = job.Company;
                current.Location = job.Location;
                current.JobType = job.JobType;
                current.Tags = job.Tags;
                current.Salary = job.Salary;
                current.SourceUrl = job.SourceUrl;
                current.PostedAt ??= job.PostedAt;
                continue;
            }

            job.PostedAt ??= DateTime.UtcNow;
            db.Jobs.Add(job);
            added++;
        }

        await db.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Synced {Added} new jobs from open APIs ({Total} fetched).", added, fetched.Count);

        return added;
    }
}
