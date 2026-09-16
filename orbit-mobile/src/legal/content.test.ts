import { describe, expect, it } from 'vitest';
import { getLegalDoc, LEGAL_DOCS, SUPPORT_EMAIL, supportMailto } from './content';

describe('legal content', () => {
  it('ships privacy policy, terms of use, and privacy notice', () => {
    expect(getLegalDoc('privacy').title).toBe('Privacy Policy');
    expect(getLegalDoc('terms').title).toBe('Terms of Use');
    expect(getLegalDoc('notice').title).toBe('Privacy Notice');
    expect(Object.keys(LEGAL_DOCS)).toEqual(['privacy', 'terms', 'notice']);
    expect(getLegalDoc('privacy').sections.length).toBeGreaterThan(3);
    expect(getLegalDoc('privacy').sections.map((s) => s.heading)).toContain('Where it is stored');
    expect(getLegalDoc('privacy').sections.find((s) => s.heading === 'Where it is stored')?.body).toMatch(
      /application database/i,
    );
    expect(getLegalDoc('privacy').sections.map((s) => s.heading)).toContain('How we protect it');
    expect(getLegalDoc('privacy').sections.find((s) => s.heading === 'How we protect it')?.body).toMatch(
      /masked number/i,
    );
    expect(getLegalDoc('notice').sections[0].body).toMatch(/customer database/i);
  });

  it('points support mail at the Orbit inbox', () => {
    expect(SUPPORT_EMAIL).toBe('support@orbit.app');
    expect(supportMailto()).toContain('mailto:support@orbit.app');
  });
});
