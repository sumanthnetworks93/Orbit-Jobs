import { describe, expect, it } from 'vitest';
import { greeting, matchLabel } from './data';

describe('matchLabel', () => {
  it('bands scores into hiring labels', () => {
    expect(matchLabel(95)).toBe('Excellent Match');
    expect(matchLabel(80)).toBe('Strong Match');
    expect(matchLabel(61)).toBe('Potential Match');
    expect(matchLabel(40)).toBe('Review');
  });
});

describe('greeting', () => {
  it('changes by hour of day', () => {
    expect(greeting(new Date('2026-09-11T08:00:00'))).toBe('Good morning');
    expect(greeting(new Date('2026-09-11T14:00:00'))).toBe('Good afternoon');
    expect(greeting(new Date('2026-09-11T20:00:00'))).toBe('Good evening');
  });
});
