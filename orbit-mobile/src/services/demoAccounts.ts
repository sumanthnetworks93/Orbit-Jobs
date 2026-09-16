import type { AuthUser } from './auth';

export const DEMO_PASSWORD = 'OrbitDemo1!';

export const DEMO_SEEKER: AuthUser = {
  uid: 'demo-seeker',
  email: 'priya@orbit.app',
  displayName: 'Priya Rao',
  name: 'Priya Rao',
  role: 'seeker',
};

export type DemoAccount = {
  email: string;
  user: AuthUser;
};

/** Always-on local accounts. Same password for seeker, employer, and Super Admin. */
export const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: 'priya@orbit.app', user: DEMO_SEEKER },
  { email: 'sarah@helios.health', user: { uid: 'employer-user', email: 'sarah@helios.health', displayName: 'Sarah Bennett', name: 'Sarah Bennett', role: 'employer', company: 'Helios Health' } },
  { email: 'admin@orbit.test', user: { uid: 'admin-user', email: 'admin@orbit.test', displayName: 'Orbit Super Admin', name: 'Orbit Super Admin', role: 'admin', company: 'Orbit Control' } },
];

export function findDemoAccount(email: string, password: string): AuthUser | null {
  if (password !== DEMO_PASSWORD) return null;
  const normalized = email.trim().toLowerCase();
  return DEMO_ACCOUNTS.find((item) => item.email === normalized)?.user ?? null;
}
