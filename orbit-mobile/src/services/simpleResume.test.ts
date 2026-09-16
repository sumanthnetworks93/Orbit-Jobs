import { describe, expect, it } from 'vitest';
import { generateResume } from '../hyd/voice';
import { previewSimpleResume } from './simpleResume';

describe('simple profile resume', () => {
  it('builds a short resume with education and skills', () => {
    const text = generateResume({
      name: 'Priya Rao',
      phone: '9876543210',
      area: 'Gachibowli',
      lastJob: 'Staff Nurse',
      joinWhen: 'Immediate',
      education: 'B.Sc Nursing',
      skills: 'Telugu · Night shift',
    });
    expect(text).toContain('Priya Rao');
    expect(text).toContain('B.Sc Nursing');
    expect(text).toContain('Telugu');
    expect(text).toContain('987****210');
    expect(text).not.toContain('9876543210');
  });

  it('previews a draft even when some fields are empty', () => {
    expect(previewSimpleResume({
      name: 'Ravi',
      phone: '',
      area: '',
      lastJob: 'Driver',
      joinWhen: '',
      education: '',
      skills: '',
    })).toContain('Ravi');
  });
});
