import { describe, expect, it } from 'vitest';
import {
  pendingAdminProfiles,
  suspendedAdminProfiles,
  verifiedAdminProfiles,
  type AdminProfile,
} from './adminModeration';

const sample: AdminProfile[] = [
  { id: 'ap-1', name: 'A', role: 'seeker', email: 'a@test', status: 'pending' },
  { id: 'ap-2', name: 'B', role: 'employer', email: 'b@test', status: 'verified' },
  { id: 'ap-3', name: 'C', role: 'seeker', email: 'c@test', status: 'pending', suspended: true },
];

describe('pendingAdminProfiles', () => {
  it('returns only pending rows that are not suspended', () => {
    expect(pendingAdminProfiles(sample).map((item) => item.id)).toEqual(['ap-1']);
  });
});

describe('verifiedAdminProfiles', () => {
  it('returns verified accounts that are still active', () => {
    expect(verifiedAdminProfiles(sample).map((item) => item.id)).toEqual(['ap-2']);
  });
});

describe('suspendedAdminProfiles', () => {
  it('returns suspended accounts', () => {
    expect(suspendedAdminProfiles(sample).map((item) => item.id)).toEqual(['ap-3']);
  });
});
