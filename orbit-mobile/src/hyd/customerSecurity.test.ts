import { describe, expect, it } from 'vitest';
import {
  forEmployerView,
  isValidIndianMobile,
  maskCustomerPhone,
  persistablePhone,
  redactPhonesInText,
  sanitizeApplyFields,
  sanitizeCustomerText,
} from './customerSecurity';

describe('customer data security', () => {
  it('accepts Indian mobiles and rejects junk', () => {
    expect(isValidIndianMobile('9876543210')).toBe(true);
    expect(isValidIndianMobile('+91 98765 43210')).toBe(true);
    expect(isValidIndianMobile('12345')).toBe(false);
    expect(isValidIndianMobile('<script>')).toBe(false);
  });

  it('never writes a raw mobile into stored fields', () => {
    expect(maskCustomerPhone('9876543210')).toBe('987****210');
    expect(persistablePhone('+91 9876543210')).toBe('987****210');
    expect(maskCustomerPhone('987****210')).toBe('987****210');
    expect(redactPhonesInText('Call 9876543210 now')).toBe('Call 987****210 now');
  });

  it('strips markup and caps length', () => {
    expect(sanitizeCustomerText('<b>Priya</b> Rao<script>x</script>', 80)).toBe('Priya Rao');
  });

  it('sanitizes apply fields before save', () => {
    const result = sanitizeApplyFields({
      name: '  Priya Rao  ',
      phone: '+91-9876543210',
      area: 'Gachibowli',
      lastJob: 'Staff Nurse',
      joinWhen: 'Immediate',
      voiceNote: '<script>alert(1)</script>I can join tomorrow',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.phone).toBe('9876543210');
    expect(result.value.voiceNote).not.toMatch(/script/i);
  });

  it('redacts phone and resume for employer views', () => {
    const view = forEmployerView({
      phone: '9876543210',
      resumeText: 'Priya\nPhone (via Orbit): 9876543210',
      voiceNote: 'Call me on 9876543210',
    });
    expect(view.phone).toBe('987****210');
    expect(view.resumeText).not.toContain('9876543210');
    expect(view.voiceNote).toContain('987****210');
  });
});
