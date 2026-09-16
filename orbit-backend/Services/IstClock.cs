using System.Globalization;

namespace Orbit.Api.Services;

public static class IstClock
{
    public static TimeZoneInfo Zone { get; } = Resolve();

    public static (DateTime StartUtc, DateTime EndUtc, string TodayKey) TodayUtcRange(DateTime utcNow)
    {
        var istNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(utcNow, DateTimeKind.Utc), Zone);
        var startIst = new DateTime(istNow.Year, istNow.Month, istNow.Day, 0, 0, 0, DateTimeKind.Unspecified);
        var startUtc = TimeZoneInfo.ConvertTimeToUtc(startIst, Zone);
        return (startUtc, startUtc.AddDays(1), startIst.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture));
    }

    public static string DayKey(DateTime postedAtUtc)
    {
        var utc = DateTime.SpecifyKind(postedAtUtc, DateTimeKind.Utc);
        var ist = TimeZoneInfo.ConvertTimeFromUtc(utc, Zone);
        return ist.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
    }

    public static DateTime Parse(long epoch, string? iso)
    {
        if (epoch > 0)
        {
            var seconds = epoch > 10_000_000_000 ? epoch / 1000 : epoch;
            return DateTimeOffset.FromUnixTimeSeconds(seconds).UtcDateTime;
        }

        if (!string.IsNullOrWhiteSpace(iso) && DateTimeOffset.TryParse(iso, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var parsed))
        {
            return parsed.UtcDateTime;
        }

        return DateTime.UtcNow;
    }

    static TimeZoneInfo Resolve()
    {
        foreach (var id in new[] { "Asia/Kolkata", "India Standard Time" })
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById(id);
            }
            catch (TimeZoneNotFoundException)
            {
            }
        }

        return TimeZoneInfo.Utc;
    }
}
