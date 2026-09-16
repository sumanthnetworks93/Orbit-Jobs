import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  applied: 'orbit_profile_applied',
  posted: 'orbit_profile_posted',
  upvoted: 'orbit_profile_upvoted',
} as const;

export type ProfileStatKey = keyof typeof KEYS;

export type ProfileStats = Record<ProfileStatKey, number>;

async function readCount(key: string): Promise<number> {
  const raw = await AsyncStorage.getItem(key);
  const value = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(value) ? value : 0;
}

export async function getProfileStats(): Promise<ProfileStats> {
  const [applied, posted, upvoted] = await Promise.all([
    readCount(KEYS.applied),
    readCount(KEYS.posted),
    readCount(KEYS.upvoted),
  ]);

  return { applied, posted, upvoted };
}

export async function incrementProfileStat(stat: ProfileStatKey): Promise<ProfileStats> {
  const key = KEYS[stat];
  const next = (await readCount(key)) + 1;
  await AsyncStorage.setItem(key, String(next));
  return getProfileStats();
}
