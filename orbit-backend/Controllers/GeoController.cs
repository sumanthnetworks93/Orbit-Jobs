using Microsoft.AspNetCore.Mvc;
using Orbit.Api.Services;

namespace Orbit.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GeoController(IpGeolocationService geo) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<GeoLocationDto>> Get(CancellationToken cancellationToken)
    {
        var ip = IpGeolocationService.ResolveClientIp(HttpContext);
        var location = await geo.LookupAsync(ip, cancellationToken);
        if (location is null)
        {
            return StatusCode(503, new { error = "IP geolocation is unavailable." });
        }

        return Ok(location);
    }
}
