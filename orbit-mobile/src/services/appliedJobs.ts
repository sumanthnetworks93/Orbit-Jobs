import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Job } from '../types';
import { incrementProfileStat } from './profileActivity';

const APPLIED_JOBS_KEY = 'orbit_applied_jobs';

export type AppliedJob = Job & { appliedAt: string };

export async function getAppliedJobs(): Promise<AppliedJob[]> {
  const raw = await AsyncStorage.getItem(APPLIED_JOBS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as AppliedJob[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function recordAppliedJob(job: Job): Promise<AppliedJob[]> {
  const current = await getAppliedJobs();
  if (current.some((item) => item.id === job.id)) {
    return current;
  }

  const next: AppliedJob[] = [{ ...job, appliedAt: new Date().toISOString() }, ...current];
  await AsyncStorage.setItem(APPLIED_JOBS_KEY, JSON.stringify(next));
  await incrementProfileStat('applied');
  return next;
}
