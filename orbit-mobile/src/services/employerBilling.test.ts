import { describe, expect, it } from 'vitest';
import { getPlan, quoteJobPost, rupees } from './employerBilling';

describe('quoteJobPost', () => {
  const free = getPlan('free');
  const starter = getPlan('starter');

  it('gives two free jobs a month on the Free plan, then ₹25', () => {
    expect(quoteJobPost(0, free)).toMatchObject({ chargeInr: 0, remainingIncluded: 2, source: 'included' });
    expect(quoteJobPost(1, free)).toMatchObject({ chargeInr: 0, remainingIncluded: 1, source: 'included' });
    expect(quoteJobPost(2, free)).toMatchObject({ chargeInr: 25, remainingIncluded: 0, source: 'extra' });
    expect(quoteJobPost(5, free).chargeInr).toBe(25);
  });

  it('includes 10 jobs on Starter before extras', () => {
    expect(quoteJobPost(9, starter).chargeInr).toBe(0);
    expect(quoteJobPost(10, starter).chargeInr).toBe(25);
  });

  it('formats rupees', () => {
    expect(rupees(25)).toBe('₹25');
    expect(rupees(199)).toBe('₹199');
  });
});
