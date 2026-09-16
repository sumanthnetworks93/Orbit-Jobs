import { describe, expect, it } from 'vitest';
import { maskPhone, relayTel, whatsappUrl } from './whatsapp';

describe('whatsapp helpers', () => {
  it('masks the last two digits of a phone', () => {
    expect(maskPhone('914067221100')).toContain('00');
    expect(maskPhone('914067221100')).toContain('Orbit relay');
    expect(maskPhone(null)).toContain('34');
  });

  it('builds a wa.me apply link with the job and company', () => {
    const url = whatsappUrl('Staff Nurse', 'KIMS Hospitals', 'Priya');
    expect(url.startsWith('https://wa.me/914067001234?text=')).toBe(true);
    const text = decodeURIComponent(url.split('text=')[1] ?? '');
    expect(text).toContain('Staff Nurse');
    expect(text).toContain('KIMS Hospitals');
    expect(text).toContain('Priya');
  });

  it('returns the Orbit relay tel link', () => {
    expect(relayTel()).toBe('tel:+914067001234');
  });
});
