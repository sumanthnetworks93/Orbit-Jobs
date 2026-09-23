import { describe, expect, it } from 'vitest';
import { resolveApiBaseUrl } from './api';

describe('resolveApiBaseUrl', () => {
  it('returns configured url when on native even if window is globally defined without location', () => {
    // Simulate React Native / Hermes environment where window = globalThis, but window.location is undefined
    (globalThis as any).window = {};
    const url = resolveApiBaseUrl();
    expect(url).toBeDefined();
    expect(typeof url).toBe('string');
    delete (globalThis as any).window;
  });
});
