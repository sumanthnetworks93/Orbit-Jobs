import { describe, expect, it } from 'vitest';
import { rankMatchedJobs, scoreJobMatch } from './match';
import { HYD_JOBS } from './seed';

describe('scoreJobMatch', () => {
  const nurse = HYD_JOBS.find((job) => job.id === 9001)!;

  it('scores a Gachibowli nurse highly on the KIMS walk-in', () => {
    const result = scoreJobMatch(nurse, { role: 'nurse', area: 'Gachibowli' });
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.reasons.some((line) => /role/i.test(line))).toBe(true);
    expect(result.reasons.some((line) => /gachibowli/i.test(line))).toBe(true);
  });

  it('does not treat a Madhapur delivery job as a nurse match', () => {
    const delivery = HYD_JOBS.find((job) => job.id === 9002)!;
    expect(scoreJobMatch(delivery, { role: 'nurse', area: 'Gachibowli' }).score).toBeLessThan(45);
  });
});

describe('rankMatchedJobs', () => {
  it('ranks the nurse walk-in first for a Gachibowli nurse', () => {
    const ranked = rankMatchedJobs(HYD_JOBS, { role: 'Staff Nurse', area: 'Gachibowli' });
    expect(ranked[0]?.job.id).toBe(9001);
    expect(ranked.some((item) => item.job.id === 9005)).toBe(false);
  });

  it('ranks the HITEC cab role for a driver', () => {
    const ranked = rankMatchedJobs(HYD_JOBS, { role: 'driver', area: 'HITEC' });
    expect(ranked[0]?.job.id).toBe(9007);
  });
});
