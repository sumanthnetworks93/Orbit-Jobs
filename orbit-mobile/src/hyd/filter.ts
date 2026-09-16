import type { Job, JobFilters } from '../types';
import { getPlatformControlsSync } from '../services/adminControl';
import { getJobOverride } from '../services/adminJobs';
import { HYD_JOBS, isGhostFrozen, type HydJob } from './seed';
import { jobMatchesDistrict } from './areas';

export function asHyd(job: Job): HydJob | null {
  return job.id >= 9000 ? (job as HydJob) : null;
}

export function isJobVisibleToSeekers(job: HydJob): boolean {
  const override = getJobOverride(job.id);
  if (override?.hidden) return false;
  const frozen = override?.frozen ?? Boolean(job.frozen);
  if (frozen) return false;
  if (getPlatformControlsSync().autoFreezeGhosts && isGhostFrozen({ ...job, frozen: false })) return false;
  return true;
}

export function isJobFrozenForDisplay(job: Job): boolean {
  const hyd = asHyd(job);
  const override = hyd ? getJobOverride(hyd.id) : undefined;
  if (override?.frozen !== undefined) {
    return override.frozen || Boolean(
      hyd && getPlatformControlsSync().autoFreezeGhosts && isGhostFrozen({ ...hyd, frozen: false }),
    );
  }
  if (job.frozen) return true;
  if (hyd && getPlatformControlsSync().autoFreezeGhosts) {
    return isGhostFrozen({ ...hyd, frozen: false });
  }
  return false;
}

export function countFrozenHydJobs(jobs: HydJob[] = HYD_JOBS): number {
  return jobs.filter((job) => !isJobVisibleToSeekers(job)).length;
}

export function visibleWalkInJobs(jobs: HydJob[] = HYD_JOBS): HydJob[] {
  return jobs.filter((job) => Boolean(job.walkIn) && isJobVisibleToSeekers(job));
}

export function matchesHydFilters(job: HydJob, filters: JobFilters): boolean {
  if (!isJobVisibleToSeekers(job)) return false;
  const q = filters.search.trim().toLowerCase();
  if (q && !`${job.title} ${job.company} ${job.tags} ${job.area}`.toLowerCase().includes(q)) return false;
  if (filters.jobType && job.jobType !== filters.jobType) return false;
  const loc = filters.location.trim().toLowerCase();
  if (loc && !filters.area && !`${job.location} ${job.area}`.toLowerCase().includes(loc)) return false;
  if (filters.remoteOnly) return false;
  if (filters.area && !jobMatchesDistrict(job.area, filters.area)) return false;
  if (filters.womenSafe && !job.womenSafe) return false;
  if (filters.cabProvided && !job.cabProvided) return false;
  if (filters.nearMetro && !job.nearMetro) return false;
  if (filters.lateShift && !job.lateShift) return false;
  if (filters.verifiedOnly && !job.verifiedEmployer) return false;
  if (filters.walkInOnly && !job.walkIn) return false;
  return true;
}

export function mergeHydJobs(remote: Job[], filters: JobFilters, page: number): Job[] {
  if (page > 1) return remote;
  const hyd = HYD_JOBS.filter((job) => matchesHydFilters(job, filters));
  const remoteIds = new Set(remote.map((job) => job.id));
  return [...hyd.filter((job) => !remoteIds.has(job.id)), ...remote];
}
