import { describe, expect, it } from 'vitest';
import {
  isLoopbackHost,
  phonePreviewFromLocation,
  qrImageSrc,
  resolvePhonePreviewUrl,
  rewriteHost,
} from './previewUrl';

describe('phone preview URL', () => {
  it('does not QR localhost — a phone cannot open that', () => {
    expect(isLoopbackHost('localhost')).toBe(true);
    expect(phonePreviewFromLocation('localhost', '8081')).toBeNull();
  });

  it('uses the current LAN host when the page is already on Wi-Fi', () => {
    expect(phonePreviewFromLocation('172.16.225.77', '8081')).toBe('http://172.16.225.77:8081/');
  });

  it('rewrites a stale API host to the phone page host', () => {
    expect(rewriteHost('http://192.168.1.68:5189', '172.16.225.77')).toBe('http://172.16.225.77:5189');
  });

  it('builds a QR image for the live URL', () => {
    expect(qrImageSrc('http://172.16.225.77:8081/')).toContain('172.16.225.77');
  });

  it('asks the API for a LAN URL when the desktop is on localhost', async () => {
    const url = await resolvePhonePreviewUrl({
      hostname: 'localhost',
      port: '8081',
      apiBaseUrl: 'http://192.168.1.68:5189',
      fetchJson: async (requestUrl) => {
        if (requestUrl.includes('127.0.0.1:5189')) {
          return { ip: '172.16.225.77', port: 8081, url: 'http://172.16.225.77:8081/' };
        }
        throw new Error('stale API host');
      },
    });
    expect(url).toBe('http://172.16.225.77:8081/');
  });
});
