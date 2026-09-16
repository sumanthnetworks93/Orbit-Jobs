import { describe, expect, it } from 'vitest';
import { DEMO_PASSWORD, DEMO_SEEKER, findDemoAccount } from './demoAccounts';

describe('demo accounts', () => {
  it('signs in the always-on seeker with the shared password', () => {
    expect(findDemoAccount('priya@orbit.app', DEMO_PASSWORD)).toEqual(DEMO_SEEKER);
    expect(findDemoAccount('  PRIYA@ORBIT.APP ', DEMO_PASSWORD)?.role).toBe('seeker');
  });

  it('maps employer and super admin emails', () => {
    expect(findDemoAccount('sarah@helios.health', DEMO_PASSWORD)?.role).toBe('employer');
    expect(findDemoAccount('admin@orbit.test', DEMO_PASSWORD)?.role).toBe('admin');
  });

  it('rejects a wrong password or unknown email', () => {
    expect(findDemoAccount('priya@orbit.app', 'wrong')).toBeNull();
    expect(findDemoAccount('nope@orbit.app', DEMO_PASSWORD)).toBeNull();
  });
});
