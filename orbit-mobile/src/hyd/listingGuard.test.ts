import { describe, expect, it } from 'vitest';
import { assertSafeListing, listingProblems } from './listingGuard';

describe('listingGuard', () => {
  it('accepts an honest Hyderabad role', () => {
    expect(
      listingProblems({
        title: 'Staff Nurse',
        company: 'KIMS',
        location: 'Gachibowli, Hyderabad',
        salary: '₹22,000–₹28,000 / month',
        tags: 'Night shift',
      }),
    ).toEqual([]);
  });

  it('blocks candidate fees and hidden pay', () => {
    expect(
      listingProblems({
        title: 'Data entry — registration fee ₹500',
        company: 'Quick Place',
        location: 'Hyderabad',
        salary: 'Competitive',
      }).join(' '),
    ).toMatch(/does not allow jobs that charge/i);

    expect(
      listingProblems({
        title: 'Intern',
        company: 'Acme',
        location: 'Hyderabad',
        salary: 'Negotiable',
      }).join(' '),
    ).toMatch(/salary or stipend/i);
  });

  it('requires employer identity and location', () => {
    const result = assertSafeListing({
      title: 'Analyst',
      company: '',
      location: '',
      salary: '₹30,000 / month',
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.problems.length).toBeGreaterThan(1);
  });
});
