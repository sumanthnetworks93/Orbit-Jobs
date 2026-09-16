namespace Orbit.Api.Models;

public class Job
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string JobType { get; set; } = string.Empty;
    public string Tags { get; set; } = string.Empty;
    public string Salary { get; set; } = string.Empty;
    public string Initial { get; set; } = string.Empty;
    public string Color { get; set; } = "#3B82F6";
    public int? StartupId { get; set; }
    public Startup? Startup { get; set; }
    public string? ExternalKey { get; set; }
    public string? SourceUrl { get; set; }
    public DateTime? PostedAt { get; set; }
}
