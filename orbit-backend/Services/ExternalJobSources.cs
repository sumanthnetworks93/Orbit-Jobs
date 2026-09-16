using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Orbit.Api.Models;

namespace Orbit.Api.Services;

public class ExternalJobSources(HttpClient http)
{
    private const int MaxPerSource = 40;

    public async Task<IReadOnlyList<Job>> FetchAllAsync(CancellationToken cancellationToken = default)
    {
        var remoteOk = await FetchRemoteOkAsync(cancellationToken);
        var remotive = await FetchRemotiveAsync(cancellationToken);
        var arbeitnow = await FetchArbeitnowAsync(cancellationToken);
        var himalayas = await FetchHimalayasAsync(cancellationToken);

        return remoteOk.Concat(remotive).Concat(arbeitnow).Concat(himalayas)
            .GroupBy(j => j.ExternalKey)
            .Select(g => g.First())
            .ToList();
    }

    private async Task<IReadOnlyList<Job>> FetchRemoteOkAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, "https://remoteok.com/api");
            request.Headers.TryAddWithoutValidation("User-Agent", "Orbit-Api/1.0");

            var response = await http.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return [];
            }

            var payload = await response.Content.ReadFromJsonAsync<List<RemoteOkEntry>>(cancellationToken);
            if (payload is null)
            {
                return [];
            }

            return payload
                .Where(entry => !string.IsNullOrWhiteSpace(entry.Id)
                    && !string.IsNullOrWhiteSpace(entry.Position)
                    && !string.IsNullOrWhiteSpace(entry.Company))
                .Take(MaxPerSource)
                .Select(MapRemoteOkJob)
                .ToList();
        }
        catch
        {
            return [];
        }
    }

    private async Task<IReadOnlyList<Job>> FetchRemotiveAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, "https://remotive.com/api/remote-jobs");
            request.Headers.TryAddWithoutValidation("User-Agent", "Orbit-Api/1.0");

            var response = await http.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return [];
            }

            var payload = await response.Content.ReadFromJsonAsync<RemotiveResponse>(cancellationToken);
            if (payload?.Jobs is null)
            {
                return [];
            }

            return payload.Jobs
                .Where(job => !string.IsNullOrWhiteSpace(job.Title) && !string.IsNullOrWhiteSpace(job.CompanyName))
                .Take(MaxPerSource)
                .Select(MapRemotiveJob)
                .ToList();
        }
        catch
        {
            return [];
        }
    }

    private async Task<IReadOnlyList<Job>> FetchArbeitnowAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, "https://www.arbeitnow.com/api/job-board-api");
            request.Headers.TryAddWithoutValidation("User-Agent", "Orbit-Api/1.0");

            var response = await http.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return [];
            }

            var payload = await response.Content.ReadFromJsonAsync<ArbeitnowResponse>(cancellationToken);
            if (payload?.Data is null)
            {
                return [];
            }

            return payload.Data
                .Where(job => !string.IsNullOrWhiteSpace(job.Slug)
                    && !string.IsNullOrWhiteSpace(job.Title)
                    && !string.IsNullOrWhiteSpace(job.CompanyName))
                .Take(MaxPerSource)
                .Select(MapArbeitnowJob)
                .ToList();
        }
        catch
        {
            return [];
        }
    }

    private async Task<IReadOnlyList<Job>> FetchHimalayasAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, "https://himalayas.app/jobs/api?limit=40");
            request.Headers.TryAddWithoutValidation("User-Agent", "Orbit-Api/1.0");

            var response = await http.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return [];
            }

            var payload = await response.Content.ReadFromJsonAsync<HimalayasResponse>(cancellationToken);
            if (payload?.Jobs is null)
            {
                return [];
            }

            return payload.Jobs
                .Where(job => !string.IsNullOrWhiteSpace(job.Guid)
                    && !string.IsNullOrWhiteSpace(job.Title)
                    && !string.IsNullOrWhiteSpace(job.CompanyName))
                .Take(MaxPerSource)
                .Select(MapHimalayasJob)
                .ToList();
        }
        catch
        {
            return [];
        }
    }

    private static Job MapRemoteOkJob(RemoteOkEntry entry)
    {
        var key = $"remoteok:{entry.Id}";
        var company = entry.Company!.Trim();
        var location = string.IsNullOrWhiteSpace(entry.Location)
            ? "Remote"
            : $"Remote · {entry.Location.Trim()}";

        return new Job
        {
            Title = entry.Position!.Trim(),
            Company = company,
            Location = location,
            JobType = InferRemoteOkJobType(entry.Tags),
            Tags = FormatRemoteOkTags(entry.Tags),
            Salary = FormatRemoteOkSalary(entry.SalaryMin, entry.SalaryMax),
            Initial = BrandColors.Initial(company),
            Color = BrandColors.Pick(key),
            ExternalKey = key,
            SourceUrl = entry.Url ?? entry.ApplyUrl ?? $"https://remoteok.com/remote-jobs/{entry.Slug}",
            PostedAt = IstClock.Parse(entry.Epoch, entry.Date),
        };
    }

    private static Job MapRemotiveJob(RemotiveJob entry)
    {
        var key = $"remotive:{entry.Id}";
        var company = entry.CompanyName!.Trim();
        var location = string.IsNullOrWhiteSpace(entry.CandidateRequiredLocation)
            ? "Remote"
            : entry.CandidateRequiredLocation.Trim();

        return new Job
        {
            Title = entry.Title.Trim(),
            Company = company,
            Location = location,
            JobType = FormatJobType(entry.JobType),
            Tags = entry.Tags is { Count: > 0 }
                ? string.Join(" · ", entry.Tags.Take(4))
                : entry.Category ?? "Remote",
            Salary = string.IsNullOrWhiteSpace(entry.Salary) ? "—" : entry.Salary.Trim(),
            Initial = BrandColors.Initial(company),
            Color = BrandColors.Pick(key),
            ExternalKey = key,
            SourceUrl = entry.Url,
            PostedAt = IstClock.Parse(0, entry.PublicationDate),
        };
    }

    private static Job MapArbeitnowJob(ArbeitnowJob entry)
    {
        var key = $"arbeitnow:{entry.Slug}";
        var company = entry.CompanyName!.Trim();
        var location = entry.Remote ? "Remote" : FormatLocation(entry.Location);

        return new Job
        {
            Title = entry.Title.Trim(),
            Company = company,
            Location = location,
            JobType = entry.JobTypes is { Count: > 0 } ? FormatJobType(entry.JobTypes[0]) : "Full-time",
            Tags = entry.Tags is { Count: > 0 }
                ? string.Join(" · ", entry.Tags.Take(4))
                : "Open role",
            Salary = "—",
            Initial = BrandColors.Initial(company),
            Color = BrandColors.Pick(key),
            ExternalKey = key,
            SourceUrl = entry.Url,
            PostedAt = IstClock.Parse(0, entry.CreatedAt),
        };
    }

    private static Job MapHimalayasJob(HimalayasJob entry)
    {
        var key = $"himalayas:{entry.Guid}";
        var company = entry.CompanyName!.Trim();
        var location = entry.LocationRestrictions is { Count: > 0 }
            ? $"Remote · {string.Join(", ", entry.LocationRestrictions.Take(2))}"
            : "Remote";

        return new Job
        {
            Title = entry.Title.Trim(),
            Company = company,
            Location = location,
            JobType = FormatJobType(entry.EmploymentType?.Replace(" ", "-")),
            Tags = entry.ParentCategories is { Count: > 0 }
                ? string.Join(" · ", entry.ParentCategories.Take(4))
                : "Remote",
            Salary = FormatHimalayasSalary(entry.MinSalary, entry.MaxSalary, entry.Currency),
            Initial = BrandColors.Initial(company),
            Color = BrandColors.Pick(key),
            ExternalKey = key,
            SourceUrl = entry.ApplicationLink,
            PostedAt = IstClock.Parse(0, entry.PubDate),
        };
    }

    private static string FormatHimalayasSalary(int? minSalary, int? maxSalary, string? currency)
    {
        var symbol = string.IsNullOrWhiteSpace(currency) || currency.Equals("USD", StringComparison.OrdinalIgnoreCase)
            ? "$"
            : $"{currency} ";

        if (minSalary is > 0 && maxSalary is > 0)
        {
            return minSalary == maxSalary
                ? $"{symbol}{minSalary:N0}"
                : $"{symbol}{minSalary:N0}–{symbol}{maxSalary:N0}";
        }

        if (minSalary is > 0)
        {
            return $"{symbol}{minSalary:N0}+";
        }

        return "—";
    }

    private static string FormatLocation(string? location) =>
        string.IsNullOrWhiteSpace(location) ? "On-site" : location.Trim();

    private static readonly HashSet<string> RemoteOkMetaTags = new(StringComparer.OrdinalIgnoreCase)
    {
        "full time", "part time", "contract", "digital nomad", "remote", "dev", "exec", "ops",
    };

    private static string InferRemoteOkJobType(IReadOnlyList<string>? tags)
    {
        if (tags is null)
        {
            return "Full-time";
        }

        foreach (var tag in tags)
        {
            if (tag.Equals("part time", StringComparison.OrdinalIgnoreCase))
            {
                return "Part-time";
            }

            if (tag.Equals("contract", StringComparison.OrdinalIgnoreCase))
            {
                return "Contract";
            }
        }

        return "Full-time";
    }

    private static string FormatRemoteOkTags(IReadOnlyList<string>? tags)
    {
        if (tags is null || tags.Count == 0)
        {
            return "Remote";
        }

        var filtered = tags
            .Where(tag => !RemoteOkMetaTags.Contains(tag))
            .Take(4)
            .ToList();

        return filtered.Count > 0 ? string.Join(" · ", filtered) : "Remote";
    }

    private static string FormatRemoteOkSalary(int salaryMin, int salaryMax)
    {
        if (salaryMin > 0 && salaryMax > 0)
        {
            return salaryMin == salaryMax
                ? $"${salaryMin:N0}"
                : $"${salaryMin:N0}–${salaryMax:N0}";
        }

        if (salaryMin > 0)
        {
            return $"${salaryMin:N0}+";
        }

        return "—";
    }

    private static string FormatJobType(string? jobType) =>
        string.IsNullOrWhiteSpace(jobType)
            ? "Full-time"
            : char.ToUpperInvariant(jobType[0]) + jobType[1..].ToLowerInvariant();

    private sealed class RemoteOkEntry
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("slug")]
        public string? Slug { get; set; }

        [JsonPropertyName("company")]
        public string? Company { get; set; }

        [JsonPropertyName("position")]
        public string? Position { get; set; }

        [JsonPropertyName("location")]
        public string? Location { get; set; }

        [JsonPropertyName("tags")]
        public List<string>? Tags { get; set; }

        [JsonPropertyName("salary_min")]
        public int SalaryMin { get; set; }

        [JsonPropertyName("salary_max")]
        public int SalaryMax { get; set; }

        [JsonPropertyName("url")]
        public string? Url { get; set; }

        [JsonPropertyName("apply_url")]
        public string? ApplyUrl { get; set; }

        [JsonPropertyName("epoch")]
        public long Epoch { get; set; }

        [JsonPropertyName("date")]
        public string? Date { get; set; }
    }

    private sealed class RemotiveResponse
    {
        [JsonPropertyName("jobs")]
        public List<RemotiveJob>? Jobs { get; set; }
    }

    private sealed class RemotiveJob
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("url")]
        public string Url { get; set; } = string.Empty;

        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("company_name")]
        public string? CompanyName { get; set; }

        [JsonPropertyName("category")]
        public string? Category { get; set; }

        [JsonPropertyName("tags")]
        public List<string>? Tags { get; set; }

        [JsonPropertyName("job_type")]
        public string? JobType { get; set; }

        [JsonPropertyName("candidate_required_location")]
        public string? CandidateRequiredLocation { get; set; }

        [JsonPropertyName("salary")]
        public string? Salary { get; set; }

        [JsonPropertyName("publication_date")]
        public string? PublicationDate { get; set; }
    }

    private sealed class ArbeitnowResponse
    {
        [JsonPropertyName("data")]
        public List<ArbeitnowJob>? Data { get; set; }
    }

    private sealed class ArbeitnowJob
    {
        [JsonPropertyName("slug")]
        public string Slug { get; set; } = string.Empty;

        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("company_name")]
        public string? CompanyName { get; set; }

        [JsonPropertyName("remote")]
        public bool Remote { get; set; }

        [JsonPropertyName("location")]
        public string? Location { get; set; }

        [JsonPropertyName("url")]
        public string Url { get; set; } = string.Empty;

        [JsonPropertyName("tags")]
        public List<string>? Tags { get; set; }

        [JsonPropertyName("job_types")]
        public List<string>? JobTypes { get; set; }

        [JsonPropertyName("created_at")]
        public string? CreatedAt { get; set; }
    }

    private sealed class HimalayasResponse
    {
        [JsonPropertyName("jobs")]
        public List<HimalayasJob>? Jobs { get; set; }
    }

    private sealed class HimalayasJob
    {
        [JsonPropertyName("guid")]
        public string Guid { get; set; } = string.Empty;

        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("companyName")]
        public string? CompanyName { get; set; }

        [JsonPropertyName("employmentType")]
        public string? EmploymentType { get; set; }

        [JsonPropertyName("applicationLink")]
        public string? ApplicationLink { get; set; }

        [JsonPropertyName("locationRestrictions")]
        public List<string>? LocationRestrictions { get; set; }

        [JsonPropertyName("parentCategories")]
        public List<string>? ParentCategories { get; set; }

        [JsonPropertyName("minSalary")]
        public int? MinSalary { get; set; }

        [JsonPropertyName("maxSalary")]
        public int? MaxSalary { get; set; }

        [JsonPropertyName("currency")]
        public string? Currency { get; set; }

        [JsonPropertyName("pubDate")]
        public string? PubDate { get; set; }
    }
}
