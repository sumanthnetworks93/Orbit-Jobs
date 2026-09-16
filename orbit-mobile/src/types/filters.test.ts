import { describe, expect, it } from 'vitest';
import {
  countActiveJobFilters,
  countActiveStartupFilters,
  defaultJobFilters,
  defaultStartupFilters,
} from './index';

describe('filter counts', () => {
  it('starts at zero', () => {
    expect(countActiveJobFilters(defaultJobFilters)).toBe(0);
    expect(countActiveStartupFilters(defaultStartupFilters)).toBe(0);
  });

  it('counts location, area, and safety filters separately', () => {
    expect(
      countActiveJobFilters({
        ...defaultJobFilters,
        location: 'Hyderabad',
        area: 'Gachibowli',
        womenSafe: true,
      }),
    ).toBe(3);
  });

  it('counts startup search and hiring-only', () => {
    expect(
      countActiveStartupFilters({
        ...defaultStartupFilters,
        search: 'health',
        hiringOnly: true,
      }),
    ).toBe(2);
  });
});
