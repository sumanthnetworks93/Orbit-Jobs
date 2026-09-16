using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;

namespace Orbit.Api.Services;

public static class LanHost
{
    public static IReadOnlyList<string> IPv4Addresses()
    {
        var found = new HashSet<string>(StringComparer.Ordinal);
        foreach (var nic in NetworkInterface.GetAllNetworkInterfaces())
        {
            if (nic.OperationalStatus != OperationalStatus.Up) continue;
            if (nic.NetworkInterfaceType is NetworkInterfaceType.Loopback) continue;

            foreach (var address in nic.GetIPProperties().UnicastAddresses)
            {
                if (address.Address.AddressFamily != AddressFamily.InterNetwork) continue;
                if (IPAddress.IsLoopback(address.Address)) continue;

                var ip = address.Address.ToString();
                if (ip.StartsWith("169.254.", StringComparison.Ordinal)) continue;
                found.Add(ip);
            }
        }

        return found.OrderBy(Score).ToList();
    }

    public static string? IPv4() => IPv4Addresses().FirstOrDefault();

    static int Score(string ip)
    {
        if (ip.StartsWith("192.168.", StringComparison.Ordinal)) return 0;
        if (ip.StartsWith("10.", StringComparison.Ordinal)) return 1;
        return 2;
    }
}
