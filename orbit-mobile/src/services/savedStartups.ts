import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Startup } from '../types';

const SAVED_STARTUPS_KEY = 'orbit_saved_startups';

export async function getSavedStartups(): Promise<Startup[]> {
  const raw = await AsyncStorage.getItem(SAVED_STARTUPS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Startup[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function toggleSavedStartup(startup: Startup): Promise<{ saved: boolean; items: Startup[] }> {
  const current = await getSavedStartups();
  const exists = current.some((item) => item.id === startup.id);

  const next = exists
    ? current.filter((item) => item.id !== startup.id)
    : [startup, ...current];

  await AsyncStorage.setItem(SAVED_STARTUPS_KEY, JSON.stringify(next));
  return { saved: !exists, items: next };
}

export async function isStartupSaved(id: number): Promise<boolean> {
  const current = await getSavedStartups();
  return current.some((item) => item.id === id);
}
