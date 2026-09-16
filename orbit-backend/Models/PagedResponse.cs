namespace Orbit.Api.Models;

public record PagedResponse<T>(
    int Page,
    int PageSize,
    int TotalCount,
    int TotalPages,
    IReadOnlyList<T> Items);
