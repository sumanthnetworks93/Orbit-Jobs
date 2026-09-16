import type { JobFilters, PagedJobsResponse } from '../types';
import { mergeHydJobs } from './filter';
import { countPostedOnDay, dayKeyInIst, mergeDayCounts } from './postedAt';

export const JOB_PAGE_SIZE = 12;

export function previewHydJobs(filters: JobFilters, page = 1): PagedJobsResponse {
  const jobs = mergeHydJobs([], filters, page);
  const hydJobs = page === 1 ? jobs.filter((job) => job.id >= 9000) : [];
  const postedByDay = Object.entries(mergeDayCounts(undefined, hydJobs)).map(([date, count]) => ({
    date,
    count,
  }));
  return {
    page,
    pageSize: JOB_PAGE_SIZE,
    totalCount: jobs.length,
    totalPages: page > 1 ? 0 : 1,
    startupCount: new Set(jobs.map((job) => job.company)).size,
    postedTodayCount: countPostedOnDay(hydJobs, dayKeyInIst(Date.now())),
    postedByDay,
    jobs,
  };
}
