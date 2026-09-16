namespace Orbit.Api.Services;

public class CurrentUser
{
    public string? UserId { get; set; }
    public bool IsAuthenticated => !string.IsNullOrEmpty(UserId);
}
