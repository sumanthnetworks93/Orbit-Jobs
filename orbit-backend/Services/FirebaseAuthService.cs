using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;

namespace Orbit.Api.Services;

public class FirebaseAuthService(IConfiguration configuration, ILogger<FirebaseAuthService> logger)
{
    private bool _initialized;

    public void EnsureInitialized()
    {
        if (_initialized || FirebaseApp.DefaultInstance != null)
        {
            _initialized = true;
            return;
        }

        var projectId = configuration["Firebase:ProjectId"];
        var credentialsPath = configuration["Firebase:CredentialsPath"];

        if (string.IsNullOrWhiteSpace(projectId))
        {
            logger.LogWarning("Firebase:ProjectId not set — API runs in dev mode without token verification.");
            return;
        }

        GoogleCredential credential;
        if (!string.IsNullOrWhiteSpace(credentialsPath) && File.Exists(credentialsPath))
        {
            credential = GoogleCredential.FromFile(credentialsPath);
        }
        else
        {
            credential = GoogleCredential.GetApplicationDefault();
        }

        FirebaseApp.Create(new AppOptions
        {
            Credential = credential,
            ProjectId = projectId,
        });

        _initialized = true;
        logger.LogInformation("Firebase Admin initialized for project {ProjectId}", projectId);
    }

    public bool IsConfigured => !string.IsNullOrWhiteSpace(configuration["Firebase:ProjectId"]);

    public async Task<string?> VerifyTokenAsync(string? bearerToken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(bearerToken))
        {
            return null;
        }

        if (!IsConfigured)
        {
            return "dev-user";
        }

        EnsureInitialized();

        if (FirebaseApp.DefaultInstance == null)
        {
            return null;
        }

        var token = bearerToken.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
            ? bearerToken[7..]
            : bearerToken;

        try
        {
            var decoded = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token, cancellationToken);
            return decoded.Uid;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Firebase token verification failed");
            return null;
        }
    }
}
