import AsyncStorage from '@react-native-async-storage/async-storage';

export type ProfileStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type AdminProfile = {
  id: string;
  name: string;
  role: 'seeker' | 'employer';
  company?: string;
  email: string;
  status: ProfileStatus;
  note?: string;
  suspended?: boolean;
};

const KEY = 'orbit_admin_profiles';

const SEED: AdminProfile[] = [
  {
    id: 'ap-1',
    name: 'Maya Chen',
    role: 'employer',
    company: 'Northline',
    email: 'hiring@northline.test',
    status: 'pending',
  },
  {
    id: 'ap-2',
    name: 'Sri Sai Kirana',
    role: 'employer',
    company: 'Sri Sai Kirana',
    email: 'shop@saisai.test',
    status: 'pending',
  },
  {
    id: 'ap-3',
    name: 'Lakshmi Kadari',
    role: 'seeker',
    email: 'lakshmi@orbit.test',
    status: 'pending',
  },
  {
    id: 'ap-4',
    name: 'Kakatiya Hospital',
    role: 'employer',
    company: 'Kakatiya Multi-Speciality',
    email: 'hr@kakatiya.test',
    status: 'verified',
    note: 'GST matches shop photo',
  },
];

export async function getAdminProfiles(): Promise<AdminProfile[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) {
      await AsyncStorage.setItem(KEY, JSON.stringify(SEED));
      return SEED;
    }
    return JSON.parse(raw) as AdminProfile[];
  } catch {
    return SEED;
  }
}

async function saveAdminProfiles(next: AdminProfile[]): Promise<AdminProfile[]> {
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function reviewAdminProfile(
  id: string,
  status: 'verified' | 'rejected',
  note?: string,
): Promise<AdminProfile[]> {
  const profiles = await getAdminProfiles();
  return saveAdminProfiles(
    profiles.map((profile) => (profile.id === id ? { ...profile, status, note } : profile)),
  );
}

export async function setAdminProfileSuspended(id: string, suspended: boolean): Promise<AdminProfile[]> {
  const profiles = await getAdminProfiles();
  return saveAdminProfiles(
    profiles.map((profile) =>
      profile.id === id
        ? { ...profile, suspended, note: suspended ? 'Suspended by Super Admin' : profile.note }
        : profile,
    ),
  );
}

export async function setAdminProfileRole(
  id: string,
  role: AdminProfile['role'],
): Promise<AdminProfile[]> {
  const profiles = await getAdminProfiles();
  return saveAdminProfiles(profiles.map((profile) => (profile.id === id ? { ...profile, role } : profile)));
}

export function pendingAdminProfiles(profiles: AdminProfile[]): AdminProfile[] {
  return profiles.filter((profile) => profile.status === 'pending' && !profile.suspended);
}

export function verifiedAdminProfiles(profiles: AdminProfile[]): AdminProfile[] {
  return profiles.filter((profile) => profile.status === 'verified' && !profile.suspended);
}

export function suspendedAdminProfiles(profiles: AdminProfile[]): AdminProfile[] {
  return profiles.filter((profile) => Boolean(profile.suspended));
}
