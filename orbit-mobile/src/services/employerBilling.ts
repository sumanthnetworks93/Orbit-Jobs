import AsyncStorage from '@react-native-async-storage/async-storage';

export const EXTRA_JOB_INR = 25;
export const FREE_JOBS_PER_MONTH = 2;

export type PlanId = 'free' | 'starter' | 'growth' | 'business';

export type MembershipPlan = {
  id: PlanId;
  name: string;
  priceInr: number;
  jobsPerMonth: number;
  extraJobInr: number;
  blurb: string;
};

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'free',
    name: 'Free',
    priceInr: 0,
    jobsPerMonth: FREE_JOBS_PER_MONTH,
    extraJobInr: EXTRA_JOB_INR,
    blurb: 'Two live jobs each calendar month. Extra posts are ₹25 each.',
  },
  {
    id: 'starter',
    name: 'Starter',
    priceInr: 199,
    jobsPerMonth: 10,
    extraJobInr: EXTRA_JOB_INR,
    blurb: 'Ten jobs a month for shops that hire often. Extra posts stay ₹25.',
  },
  {
    id: 'growth',
    name: 'Growth',
    priceInr: 449,
    jobsPerMonth: 20,
    extraJobInr: EXTRA_JOB_INR,
    blurb: 'Twenty jobs a month for clinics, warehouses, and multi-outlet teams.',
  },
  {
    id: 'business',
    name: 'Business',
    priceInr: 999,
    jobsPerMonth: 50,
    extraJobInr: EXTRA_JOB_INR,
    blurb: 'Fifty jobs a month for hospitals, BPOs, and staffing desks.',
  },
];

export type JobQuote = {
  chargeInr: number;
  source: 'included' | 'extra';
  used: number;
  included: number;
  remainingIncluded: number;
  planId: PlanId;
};

export type BillingCharge = {
  id: string;
  amountInr: number;
  reason: 'extra-job' | 'membership';
  at: string;
  month: string;
};

export type EmployerBilling = {
  planId: PlanId;
  month: string;
  postsThisMonth: number;
  charges: BillingCharge[];
};

const KEY = 'orbit_employer_billing';

export function currentMonthKey(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getPlan(id: PlanId = 'free'): MembershipPlan {
  return MEMBERSHIP_PLANS.find((plan) => plan.id === id) ?? MEMBERSHIP_PLANS[0];
}

export function quoteJobPost(usedThisMonth: number, plan: MembershipPlan): JobQuote {
  const remainingIncluded = Math.max(0, plan.jobsPerMonth - usedThisMonth);
  if (remainingIncluded > 0) {
    return {
      chargeInr: 0,
      source: 'included',
      used: usedThisMonth,
      included: plan.jobsPerMonth,
      remainingIncluded,
      planId: plan.id,
    };
  }
  return {
    chargeInr: plan.extraJobInr,
    source: 'extra',
    used: usedThisMonth,
    included: plan.jobsPerMonth,
    remainingIncluded: 0,
    planId: plan.id,
  };
}

export function rupees(amount: number) {
  return `₹${amount}`;
}

function emptyBilling(now = new Date()): EmployerBilling {
  return {
    planId: 'free',
    month: currentMonthKey(now),
    postsThisMonth: 0,
    charges: [],
  };
}

function rollMonth(billing: EmployerBilling, now = new Date()): EmployerBilling {
  const month = currentMonthKey(now);
  if (billing.month === month) return billing;
  return { ...billing, month, postsThisMonth: 0 };
}

export async function getEmployerBilling(now = new Date()): Promise<EmployerBilling> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) {
      const fresh = emptyBilling(now);
      await AsyncStorage.setItem(KEY, JSON.stringify(fresh));
      return fresh;
    }
    const stored = JSON.parse(raw) as EmployerBilling;
    const next = rollMonth(stored, now);
    if (next.month !== stored.month) {
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
    }
    return next;
  } catch {
    return emptyBilling(now);
  }
}

export async function quoteNextJobPost(now = new Date()): Promise<JobQuote> {
  const billing = await getEmployerBilling(now);
  return quoteJobPost(billing.postsThisMonth, getPlan(billing.planId));
}

async function saveBilling(next: EmployerBilling): Promise<EmployerBilling> {
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function recordJobPost(quote: JobQuote, now = new Date()): Promise<EmployerBilling> {
  const billing = rollMonth(await getEmployerBilling(now), now);
  const charges =
    quote.chargeInr > 0
      ? [
          {
            id: `ch-${Date.now()}`,
            amountInr: quote.chargeInr,
            reason: 'extra-job' as const,
            at: now.toISOString(),
            month: currentMonthKey(now),
          },
          ...billing.charges,
        ]
      : billing.charges;
  return saveBilling({
    ...billing,
    postsThisMonth: billing.postsThisMonth + 1,
    charges,
  });
}

export async function subscribeToPlan(planId: PlanId, now = new Date()): Promise<EmployerBilling> {
  const plan = getPlan(planId);
  const billing = rollMonth(await getEmployerBilling(now), now);
  const charges =
    plan.priceInr > 0
      ? [
          {
            id: `ch-${Date.now()}`,
            amountInr: plan.priceInr,
            reason: 'membership' as const,
            at: now.toISOString(),
            month: currentMonthKey(now),
          },
          ...billing.charges,
        ]
      : billing.charges;
  return saveBilling({
    ...billing,
    planId,
    charges,
  });
}

export function monthSpend(billing: EmployerBilling) {
  return billing.charges
    .filter((charge) => charge.month === billing.month)
    .reduce((sum, charge) => sum + charge.amountInr, 0);
}
