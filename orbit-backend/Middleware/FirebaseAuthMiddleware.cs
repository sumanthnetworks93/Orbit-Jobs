using Orbit.Api.Services;

namespace Orbit.Api.Middleware;

public class FirebaseAuthMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, FirebaseAuthService firebaseAuth, CurrentUser currentUser)
    {
        var authHeader = context.Request.Headers.Authorization.ToString();
        var userId = await firebaseAuth.VerifyTokenAsync(authHeader, context.RequestAborted);

        if (!string.IsNullOrEmpty(userId))
        {
            currentUser.UserId = userId;
        }

        await next(context);
    }
}
