import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPPORT_EMAIL, supportMailto } from '../legal/content';

export type ReportKind = 'job' | 'employer';

export type JobReport = {
  id: string;
  kind: ReportKind;
  jobId: number;
  title: string;
  company: string;
  at: string;
};

const KEY = 'orbit_job_reports';

export async function getJobReports(): Promise<JobReport[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as JobReport[]) : [];
  } catch {
    return [];
  }
}

export async function reportListing(kind: ReportKind, job: { id: number; title: string; company: string }): Promise<JobReport> {
  const entry: JobReport = {
    id: `rp-${Date.now()}`,
    kind,
    jobId: job.id,
    title: job.title,
    company: job.company,
    at: new Date().toISOString(),
  };
  const current = await getJobReports();
  await AsyncStorage.setItem(KEY, JSON.stringify([entry, ...current].slice(0, 50)));
  return entry;
}

export function reportMailto(kind: ReportKind, job: { title: string; company: string }) {
  const subject = kind === 'job' ? `Report job: ${job.title}` : `Report employer: ${job.company}`;
  return supportMailto(subject);
}

export { SUPPORT_EMAIL };
