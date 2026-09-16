export function dayKeyInIst(at: Date | string | number): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(at));
}

export function postedDayLabel(dayKey: string, now = Date.now()): string {
  if (dayKey === 'earlier') return 'Earlier';
  const today = dayKeyInIst(now);
  if (dayKey === today) return 'Today';
  if (dayKey === dayKeyInIst(now - 86_400_000)) return 'Yesterday';
  const [year, month, day] = dayKey.split('-').map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1)).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function isPostedOnDay(postedAt: string | null | undefined, dayKey: string): boolean {
  if (!postedAt) return false;
  return dayKeyInIst(postedAt) === dayKey;
}

export function countPostedOnDay<T extends { postedAt?: string | null }>(jobs: T[], dayKey: string): number {
  return jobs.filter((job) => isPostedOnDay(job.postedAt, dayKey)).length;
}

export type PostedDayCount = { date: string; count: number };

export function mergeDayCounts(api: PostedDayCount[] | undefined, extraJobs: { postedAt?: string | null }[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of api ?? []) {
    if (!row.date) continue;
    counts[row.date] = (counts[row.date] ?? 0) + row.count;
  }
  for (const job of extraJobs) {
    if (!job.postedAt) continue;
    const key = dayKeyInIst(job.postedAt);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

export type JobsFeedRow<T extends { id: number; postedAt?: string | null }> =
  | { kind: 'day'; key: string; label: string; count: number }
  | { kind: 'job'; job: T };

export function jobsFeedRows<T extends { id: number; postedAt?: string | null }>(
  jobs: T[],
  counts: Record<string, number>,
  now = Date.now(),
): JobsFeedRow<T>[] {
  const sorted = [...jobs].sort((left, right) => {
    const leftAt = left.postedAt ? Date.parse(left.postedAt) : 0;
    const rightAt = right.postedAt ? Date.parse(right.postedAt) : 0;
    if (rightAt !== leftAt) return rightAt - leftAt;
    return right.id - left.id;
  });

  const groups: { key: string; items: T[] }[] = [];
  for (const job of sorted) {
    const key = job.postedAt ? dayKeyInIst(job.postedAt) : 'earlier';
    const last = groups[groups.length - 1];
    if (last?.key === key) last.items.push(job);
    else groups.push({ key, items: [job] });
  }

  const rows: JobsFeedRow<T>[] = [];
  for (const group of groups) {
    rows.push({
      kind: 'day',
      key: group.key,
      label: postedDayLabel(group.key, now),
      count: group.key === 'earlier' ? group.items.length : counts[group.key] ?? group.items.length,
    });
    for (const job of group.items) {
      rows.push({ kind: 'job', job });
    }
  }
  return rows;
}
