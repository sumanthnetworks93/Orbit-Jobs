import { API_BASE_URL } from '../config/api';
import { mergeHydJobs } from '../hyd/filter';
import { JOB_PAGE_SIZE, previewHydJobs } from '../hyd/previewJobs';
import { countPostedOnDay, dayKeyInIst, mergeDayCounts } from '../hyd/postedAt';
import { HYD_JOBS } from '../hyd/seed';
import type { GeoLocation, Job, JobFilters, PagedJobsResponse, PagedResponse, Startup, StartupFilters } from '../types';
import { hydratePlatformControls } from './adminControl';
import { hydrateJobOverrides } from './adminJobs';

let adminPlaneReady: Promise<void> | null = null;

function hydrateAdminPlane() {
  if (!adminPlaneReady) {
    adminPlaneReady = Promise.all([hydratePlatformControls(), hydrateJobOverrides()])
      .then(() => undefined)
      .catch(() => undefined);
  }
  return adminPlaneReady;
}

void hydrateAdminPlane();

const STARTUP_PAGE_SIZE = 20;
const REQUEST_TIMEOUT_MS = 8000;
const JOBS_CACHE_MS = 20_000;

type JobsCacheEntry = { at: number; data: PagedJobsResponse };
const jobsCache = new Map<string, JobsCacheEntry>();

function jobsCacheKey(page: number, filters: JobFilters) {
  return JSON.stringify({
    page,
    search: filters.search.trim(),
    jobType: filters.jobType,
    location: filters.location.trim(),
    remoteOnly: filters.remoteOnly,
    area: filters.area ?? null,
    womenSafe: Boolean(filters.womenSafe),
    cabProvided: Boolean(filters.cabProvided),
    nearMetro: Boolean(filters.nearMetro),
    lateShift: Boolean(filters.lateShift),
    verifiedOnly: Boolean(filters.verifiedOnly),
    walkInOnly: Boolean(filters.walkInOnly),
  });
}

function clearJobsCache() {
  jobsCache.clear();
}

function buildQuery(params: Record<string, string | number | boolean | null | undefined>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    query.set(key, String(value));
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}

async function request<T>(path: string, token?: string | null, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Request failed (${response.status})`);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Check that the API is running and reachable.');
    }
    if (error instanceof TypeError) {
      throw new Error('Cannot reach the API. Make sure the backend is running and EXPO_PUBLIC_API_URL is set.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function mapStartup(raw: Record<string, unknown>): Startup {
  return {
    id: raw.id as number,
    name: raw.name as string,
    description: raw.description as string,
    category: raw.category as string,
    openRoles: raw.openRoles as number,
    upvotes: raw.upvotes as number,
    initial: raw.initial as string,
    color: raw.color as string,
  };
}

function mapJob(raw: Record<string, unknown>): Job {
  return {
    id: raw.id as number,
    title: raw.title as string,
    company: raw.company as string,
    location: raw.location as string,
    jobType: raw.jobType as string,
    tags: raw.tags as string,
    salary: raw.salary as string,
    initial: raw.initial as string,
    color: raw.color as string,
    sourceUrl: (raw.sourceUrl as string | null | undefined) ?? null,
    postedAt: typeof raw.postedAt === 'string' ? raw.postedAt : null,
  };
}

export async function fetchStartups(
  page = 1,
  filters: StartupFilters = { search: '', category: null, hiringOnly: false },
): Promise<PagedResponse<Startup>> {
  const query = buildQuery({
    page,
    pageSize: STARTUP_PAGE_SIZE,
    search: filters.search.trim() || undefined,
    category: filters.category ?? undefined,
    hiringOnly: filters.hiringOnly || undefined,
  });

  const data = await request<{
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    items: Record<string, unknown>[];
  }>(`/api/startups${query}`);

  return {
    page: data.page,
    pageSize: data.pageSize,
    totalCount: data.totalCount,
    totalPages: data.totalPages,
    items: data.items.map(mapStartup),
  };
}

export async function fetchStartupFilterOptions(): Promise<string[]> {
  const data = await request<{ categories: string[] }>('/api/startups/filters');
  return data.categories;
}

export type CreateStartupInput = {
  name: string;
  description: string;
  category: string;
  openRoles?: number;
};

export async function createStartup(input: CreateStartupInput, token: string): Promise<Startup> {
  const data = await request<Record<string, unknown>>('/api/startups', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return mapStartup(data);
}

export async function upvoteStartup(id: number, token: string): Promise<Startup> {
  const data = await request<Record<string, unknown>>(`/api/startups/${id}/upvote`, token, {
    method: 'POST',
  });
  return mapStartup(data);
}

export async function syncJobs(): Promise<{ added: number; total: number }> {
  try {
    return await request<{ added: number; total: number }>('/api/jobs/sync', null, {
      method: 'POST',
    });
  } catch {
    return { added: 0, total: 0 };
  }
}

export async function fetchJobs(
  page = 1,
  filters: JobFilters = { search: '', jobType: null, location: '', remoteOnly: false },
): Promise<PagedJobsResponse> {
  const key = jobsCacheKey(page, filters);
  const cached = jobsCache.get(key);
  if (cached && Date.now() - cached.at < JOBS_CACHE_MS) {
    return cached.data;
  }

  await hydrateAdminPlane();
  try {
    const query = buildQuery({
      page,
      pageSize: JOB_PAGE_SIZE,
      search: filters.search.trim() || undefined,
      jobType: filters.jobType ?? undefined,
      location: filters.location.trim() || undefined,
      remoteOnly: filters.remoteOnly || undefined,
    });

    const data = await request<{
      page: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
      startupCount: number;
      postedTodayCount?: number;
      postedByDay?: { date: string; count: number }[];
      jobs: Record<string, unknown>[];
    }>(`/api/jobs${query}`);

    const jobs = mergeHydJobs(data.jobs.map(mapJob), filters, data.page);
    const hydJobs = data.page === 1 ? jobs.filter((job) => job.id >= 9000) : [];
    const postedByDay = Object.entries(mergeDayCounts(data.postedByDay, hydJobs)).map(([date, count]) => ({
      date,
      count,
    }));
    const postedTodayCount = (data.postedTodayCount ?? 0) + countPostedOnDay(hydJobs, dayKeyInIst(Date.now()));
    const result: PagedJobsResponse = {
      page: data.page,
      pageSize: data.pageSize,
      totalCount: Math.max(data.totalCount, jobs.length),
      totalPages: data.totalPages,
      startupCount: data.startupCount,
      postedTodayCount,
      postedByDay,
      jobs,
    };
    jobsCache.set(key, { at: Date.now(), data: result });
    return result;
  } catch {
    return previewHydJobs(filters, page);
  }
}

export async function fetchJobFilterOptions(): Promise<string[]> {
  try {
    const data = await request<{ jobTypes: string[] }>('/api/jobs/filters');
    return data.jobTypes;
  } catch {
    return [...new Set(['Full-time', 'Part-time', 'Contract', 'Internship', ...HYD_JOBS.map((job) => job.jobType)])].sort();
  }
}

export type CreateJobInput = {
  title: string;
  company: string;
  location: string;
  jobType?: string;
  tags?: string;
  salary?: string;
};

export async function createJob(input: CreateJobInput, token: string) {
  const data = await request<Record<string, unknown>>('/api/jobs', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  clearJobsCache();
  return mapJob(data);
}

export async function fetchGeoLocation(): Promise<GeoLocation | null> {
  try {
    return await request<GeoLocation>('/api/geo');
  } catch {
    return null;
  }
}
