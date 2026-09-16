import AsyncStorage from '@react-native-async-storage/async-storage';
import { rankMatchedJobs, type MatchProfile, type RankedMatch } from '../hyd/match';
import { HYD_JOBS } from '../hyd/seed';

export type MatchPrefs = MatchProfile & {
  subscribed: boolean;
  whatsapp: boolean;
  readIds: number[];
};

const KEY = 'orbit_job_match_alerts';

const EMPTY: MatchPrefs = {
  role: '',
  area: '',
  subscribed: false,
  whatsapp: true,
  readIds: [],
};

export async function getMatchPrefs(): Promise<MatchPrefs> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<MatchPrefs>) };
  } catch {
    return { ...EMPTY };
  }
}

async function savePrefs(next: MatchPrefs): Promise<MatchPrefs> {
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function patchMatchPrefs(patch: Partial<MatchPrefs>): Promise<MatchPrefs> {
  const current = await getMatchPrefs();
  return savePrefs({ ...current, ...patch });
}

export async function subscribeToJobMatches(patch: Partial<MatchPrefs> = {}): Promise<MatchPrefs> {
  return patchMatchPrefs({ subscribed: true, whatsapp: patch.whatsapp ?? true, ...patch });
}

export async function unsubscribeFromJobMatches(): Promise<MatchPrefs> {
  return patchMatchPrefs({ subscribed: false });
}

export function matchedJobsFor(prefs: MatchPrefs): RankedMatch[] {
  if (!prefs.role.trim() && !prefs.area.trim()) return [];
  return rankMatchedJobs(HYD_JOBS, prefs);
}

export async function getMatchAlerts(): Promise<{ prefs: MatchPrefs; matches: RankedMatch[]; unread: number }> {
  const prefs = await getMatchPrefs();
  const matches = matchedJobsFor(prefs);
  const unread = prefs.subscribed ? matches.filter((item) => !prefs.readIds.includes(item.job.id)).length : 0;
  return { prefs, matches, unread };
}

export async function markMatchesRead(ids: number[]): Promise<MatchPrefs> {
  const prefs = await getMatchPrefs();
  return savePrefs({ ...prefs, readIds: Array.from(new Set([...prefs.readIds, ...ids])) });
}
