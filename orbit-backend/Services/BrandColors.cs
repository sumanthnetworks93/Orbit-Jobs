namespace Orbit.Api.Services;

public static class BrandColors
{
    private static readonly string[] Palette =
    [
        "#3B82F6",
        "#22C55E",
        "#F97316",
        "#A855F7",
        "#14B8A6",
    ];

    public static string Pick(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return Palette[0];
        }

        var hash = Math.Abs(value.GetHashCode(StringComparison.OrdinalIgnoreCase));
        return Palette[hash % Palette.Length];
    }

    public static string Initial(string value) =>
        string.IsNullOrWhiteSpace(value) ? "?" : value.Trim()[..1].ToUpperInvariant();
}
