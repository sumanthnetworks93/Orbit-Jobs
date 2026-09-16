import type { Job, JobFilters, PagedJobsResponse } from '../types';
import { countPostedOnDay, dayKeyInIst, mergeDayCounts } from '../hyd/postedAt';

const PALETTE = ['#3B82F6', '#22C55E', '#F97316', '#A855F7', '#14B8A6'];
const MAX_PER_SOURCE = 40;

function hashId(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) || 1;
}

function pickColor(value: string) {
  return PALETTE[hashId(value) % PALETTE.length];
}

function initial(value: string) {
  return value.trim().charAt(0).toUpperCase() || '?';
}

function jobType(value?: string | null) {
  if (!value?.trim()) return 'Full-time';
  return value.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function readJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

type RemoteOkEntry = {
  id?: string | number;
  slug?: string;
  company?: string;
  position?: string;
  location?: string;
  tags?: string[];
  salary_min?: number;
  salary_max?: number;
  url?: string;
  apply_url?: string;
  epoch?: number;
  date?: string;
};

type RemotiveJob = {
  id?: number;
  url?: string;
  title?: string;
  company_name?: string;
  category?: string;
  tags?: string[];
  job_type?: string;
  candidate_required_location?: string;
  salary?: string;
  publication_date?: string;
};

type ArbeitnowJob = {
  slug?: string;
  title?: string;
  company_name?: string;
  remote?: boolean;
  location?: string;
  url?: string;
  tags?: string[];
  job_types?: string[];
  created_at?: string;
};

type HimalayasJob = {
  guid?: string;
  title?: string;
  companyName?: string;
  employmentType?: string;
  applicationLink?: string;
  locationRestrictions?: string[];
  parentCategories?: string[];
  minSalary?: number | null;
  maxSalary?: number | null;
  currency?: string | null;
  pubDate?: string | null;
};

function mapJob(input: {
  key: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  tags: string;
  salary: string;
  sourceUrl?: string | null;
  postedAt?: string | null;
}): Job {
  return {
    id: hashId(input.key),
    title: input.title,
    company: input.company,
    location: input.location,
    jobType: input.jobType,
    tags: input.tags,
    salary: input.salary,
    initial: initial(input.company),
    color: pickColor(input.key),
    sourceUrl: input.sourceUrl ?? null,
    postedAt: input.postedAt ?? null,
  };
}

async function fetchRemoteOk(): Promise<Job[]> {
  const payload = await readJson<RemoteOkEntry[]>('https://remoteok.com/api');
  if (!Array.isArray(payload)) return [];

  return payload
    .filter((entry) => entry.position && entry.company && entry.id != null)
    .slice(0, MAX_PER_SOURCE)
    .map((entry) => {
      const min = entry.salary_min ?? 0;
      const max = entry.salary_max ?? 0;
      const salary = min > 0 && max > 0 ? `$${min.toLocaleString()}–$${max.toLocaleString()}` : min > 0 ? `$${min.toLocaleString()}+` : '—';
      return mapJob({
        key: `remoteok:${entry.id}`,
        title: String(entry.position).trim(),
        company: String(entry.company).trim(),
        location: entry.location?.trim() ? `Remote · ${entry.location.trim()}` : 'Remote',
        jobType: 'Full-time',
        tags: (entry.tags ?? []).slice(0, 4).join(' · ') || 'Remote',
        salary,
        sourceUrl: entry.url ?? entry.apply_url ?? null,
        postedAt: entry.date ?? (entry.epoch ? new Date(entry.epoch > 10_000_000_000 ? entry.epoch : entry.epoch * 1000).toISOString() : null),
      });
    });
}

async function fetchRemotive(): Promise<Job[]> {
  const payload = await readJson<{ jobs?: RemotiveJob[] }>('https://remotive.com/api/remote-jobs');
  return (payload?.jobs ?? [])
    .filter((job) => job.title && job.company_name)
    .slice(0, MAX_PER_SOURCE)
    .map((job) =>
      mapJob({
        key: `remotive:${job.id ?? job.title}`,
        title: String(job.title).trim(),
        company: String(job.company_name).trim(),
        location: job.candidate_required_location?.trim() || 'Remote',
        jobType: jobType(job.job_type),
        tags: (job.tags ?? []).slice(0, 4).join(' · ') || job.category || 'Remote',
        salary: job.salary?.trim() || '—',
        sourceUrl: job.url ?? null,
        postedAt: job.publication_date ?? null,
      }),
    );
}

async function fetchArbeitnow(): Promise<Job[]> {
  const payload = await readJson<{ data?: ArbeitnowJob[] }>('https://www.arbeitnow.com/api/job-board-api');
  return (payload?.data ?? [])
    .filter((job) => job.slug && job.title && job.company_name)
    .slice(0, MAX_PER_SOURCE)
    .map((job) =>
      mapJob({
        key: `arbeitnow:${job.slug}`,
        title: String(job.title).trim(),
        company: String(job.company_name).trim(),
        location: job.remote ? 'Remote' : job.location?.trim() || 'On-site',
        jobType: jobType(job.job_types?.[0]),
        tags: (job.tags ?? []).slice(0, 4).join(' · ') || 'Open role',
        salary: '—',
        sourceUrl: job.url ?? null,
        postedAt: job.created_at ?? null,
      }),
    );
}

async function fetchHimalayas(): Promise<Job[]> {
  const payload = await readJson<{ jobs?: HimalayasJob[] }>('https://himalayas.app/jobs/api?limit=40');
  return (payload?.jobs ?? [])
    .filter((job) => job.guid && job.title && job.companyName)
    .slice(0, MAX_PER_SOURCE)
    .map((job) => {
      const min = job.minSalary ?? 0;
      const max = job.maxSalary ?? 0;
      const symbol = !job.currency || job.currency === 'USD' ? '$' : `${job.currency} `;
      const salary = min > 0 && max > 0 ? `${symbol}${min.toLocaleString()}–${symbol}${max.toLocaleString()}` : min > 0 ? `${symbol}${min.toLocaleString()}+` : '—';
      return mapJob({
        key: `himalayas:${job.guid}`,
        title: String(job.title).trim(),
        company: String(job.companyName).trim(),
        location: job.locationRestrictions?.length
          ? `Remote · ${job.locationRestrictions.slice(0, 2).join(', ')}`
          : 'Remote',
        jobType: jobType(job.employmentType?.replace(/ /g, '-')),
        tags: (job.parentCategories ?? []).slice(0, 4).join(' · ') || 'Remote',
        salary,
        sourceUrl: job.applicationLink ?? null,
        postedAt: job.pubDate ?? null,
      });
    });
}

function applyFilters(jobs: Job[], filters: JobFilters) {
  const search = filters.search.trim().toLowerCase();
  return jobs.filter((job) => {
    if (search) {
      const haystack = `${job.title} ${job.company} ${job.tags}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (filters.jobType && job.jobType !== filters.jobType) return false;
    if (filters.location.trim() && !job.location.toLowerCase().includes(filters.location.trim().toLowerCase())) {
      return false;
    }
    if (filters.remoteOnly && !job.location.toLowerCase().includes('remote')) return false;
    return true;
  });
}

export async function fetchPublicJobs(
  page = 1,
  filters: JobFilters = { search: '', jobType: null, location: '', remoteOnly: false },
  pageSize = 5,
): Promise<PagedJobsResponse> {
  const batches = await Promise.all([
    fetchRemoteOk(),
    fetchRemotive(),
    fetchArbeitnow(),
    fetchHimalayas(),
  ]);

  const seen = new Set<number>();
  const jobs = batches.flat().filter((job) => {
    if (seen.has(job.id)) return false;
    seen.add(job.id);
    return true;
  });

  const filtered = applyFilters(jobs, filters);
  const totalPages = filtered.length === 0 ? 0 : Math.ceil(filtered.length / pageSize);
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * pageSize;
  const today = dayKeyInIst(Date.now());
  const postedByDay = Object.entries(mergeDayCounts(undefined, filtered)).map(([date, count]) => ({ date, count }));

  return {
    page: safePage,
    pageSize,
    totalCount: filtered.length,
    totalPages,
    startupCount: new Set(filtered.map((job) => job.company)).size,
    postedTodayCount: countPostedOnDay(filtered, today),
    postedByDay,
    jobs: filtered.slice(start, start + pageSize),
  };
}

export async function fetchPublicJobTypes(): Promise<string[]> {
  const data = await fetchPublicJobs(1, { search: '', jobType: null, location: '', remoteOnly: false }, 200);
  return [...new Set(data.jobs.map((job) => job.jobType))].sort();
}
