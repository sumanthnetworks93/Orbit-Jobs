const LOOPBACK = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

export type PreviewPayload = {
  ip?: string;
  port?: number;
  url?: string;
  addresses?: string[];
};

export function isLoopbackHost(hostname: string): boolean {
  return LOOPBACK.has(hostname.trim().toLowerCase());
}

export function rewriteHost(url: string, hostname: string): string {
  const next = new URL(url);
  next.hostname = hostname;
  return next.toString().replace(/\/$/, '');
}

export function phonePreviewFromLocation(hostname: string, port: string, protocol = 'http:'): string | null {
  if (!hostname || isLoopbackHost(hostname)) return null;
  const suffix = port ? `:${port}` : '';
  return `${protocol}//${hostname}${suffix}/`;
}

export function qrImageSrc(url: string, size = 220): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(url)}`;
}

export function normalizePreviewUrl(url: string): string {
  const parsed = new URL(url);
  parsed.search = '';
  parsed.hash = '';
  const href = parsed.toString();
  return href.endsWith('/') ? href : `${href}/`;
}

export async function resolvePhonePreviewUrl(opts: {
  hostname: string;
  port: string;
  protocol?: string;
  apiBaseUrl: string;
  fetchJson?: (url: string) => Promise<PreviewPayload>;
}): Promise<string> {
  const fromLocation = phonePreviewFromLocation(opts.hostname, opts.port, opts.protocol ?? 'http:');
  if (fromLocation) return normalizePreviewUrl(fromLocation);

  const pagePort = Number(opts.port) || 8081;
  const candidates = [
    `${opts.apiBaseUrl.replace(/\/$/, '')}/preview?port=${pagePort}`,
    `http://127.0.0.1:5189/preview?port=${pagePort}`,
    `http://localhost:5189/preview?port=${pagePort}`,
  ];

  const fetchJson = opts.fetchJson ?? (async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`preview ${response.status}`);
    return (await response.json()) as PreviewPayload;
  });

  for (const candidate of [...new Set(candidates)]) {
    try {
      const body = await fetchJson(candidate);
      if (!body.url) continue;
      const host = new URL(body.url).hostname;
      if (isLoopbackHost(host)) continue;
      return normalizePreviewUrl(body.url);
    } catch {
      // Try the next preview origin.
    }
  }

  throw new Error('Could not detect a Wi-Fi address for phone preview.');
}
