import type { Job } from '../types';
import type { HydArea } from './areas';

export type WalkIn = {
  date: string;
  time: string;
  venue: string;
  askFor: string;
  bring: string;
};

export type HydJob = Job & {
  area: HydArea | 'Secunderabad';
  womenSafe?: boolean;
  cabProvided?: boolean;
  nearMetro?: boolean;
  lateShift?: boolean;
  verifiedEmployer?: boolean;
  gstin?: string;
  lastReplyAt?: string;
  frozen?: boolean;
  walkIn?: WalkIn;
  employerPhone?: string;
  commuteMin?: number;
};

const daysAgo = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

export const HYD_JOBS: HydJob[] = [
  {
    id: 9001,
    title: 'Staff Nurse',
    company: 'KIMS Hospitals',
    location: 'Gachibowli, Hyderabad',
    jobType: 'Full-time',
    tags: 'Night shift · Women-safe',
    salary: '₹28k–₹36k',
    initial: 'K',
    color: '#1B6B45',
    area: 'Gachibowli',
    womenSafe: true,
    cabProvided: true,
    nearMetro: true,
    lateShift: true,
    verifiedEmployer: true,
    gstin: '36AABCK1234H1Z5',
    lastReplyAt: daysAgo(1),
    commuteMin: 22,
    postedAt: daysAgo(0),
    walkIn: {
      date: 'Sep 9, 2026',
      time: '10:00 AM – 1:00 PM',
      venue: 'KIMS Gachibowli, Gate 2',
      askFor: 'Nursing HR',
      bring: 'Aadhaar + nursing certificate',
    },
    employerPhone: '914067221100',
  },
  {
    id: 9002,
    title: 'Delivery Associate',
    company: 'Swiggy',
    location: 'Madhapur, Hyderabad',
    jobType: 'Part-time',
    tags: 'Bike · Same day',
    salary: '₹18k–₹25k',
    initial: 'S',
    color: '#E85D04',
    area: 'Madhapur',
    cabProvided: false,
    nearMetro: true,
    verifiedEmployer: true,
    gstin: '36AAGCS1234P1Z2',
    lastReplyAt: daysAgo(0),
    commuteMin: 18,
    postedAt: daysAgo(0),
    employerPhone: '914067221101',
  },
  {
    id: 9003,
    title: 'Financial Analyst',
    company: 'Helios Health',
    location: 'HITEC City, Hyderabad',
    jobType: 'Full-time',
    tags: 'Excel · Hybrid',
    salary: '₹8L–₹12L',
    initial: 'H',
    color: '#16140F',
    area: 'HITEC City',
    nearMetro: true,
    verifiedEmployer: true,
    gstin: '36AAACH7788Q1Z9',
    lastReplyAt: daysAgo(2),
    commuteMin: 15,
    postedAt: daysAgo(0),
    employerPhone: '914067221102',
  },
  {
    id: 9004,
    title: 'Front Office Executive',
    company: 'AIG Hospitals',
    location: 'Financial District, Hyderabad',
    jobType: 'Full-time',
    tags: 'Reception · Women-safe',
    salary: '₹22k–₹28k',
    initial: 'A',
    color: '#2F5D4A',
    area: 'Financial District',
    womenSafe: true,
    nearMetro: true,
    verifiedEmployer: true,
    gstin: '36AAACA9999B1Z1',
    lastReplyAt: daysAgo(3),
    commuteMin: 25,
    postedAt: daysAgo(1),
    walkIn: {
      date: 'Sep 10, 2026',
      time: '9:30 AM – 12:30 PM',
      venue: 'AIG Financial District lobby',
      askFor: 'Admin desk',
      bring: 'Resume optional · Aadhaar',
    },
    employerPhone: '914067221103',
  },
  {
    id: 9005,
    title: 'Security Supervisor',
    company: 'North Gate Facilities',
    location: 'Kompally, Hyderabad',
    jobType: 'Full-time',
    tags: 'Night · Unverified',
    salary: '₹16k–₹20k',
    initial: 'N',
    color: '#7A4A3A',
    area: 'Kompally',
    lateShift: true,
    verifiedEmployer: false,
    lastReplyAt: daysAgo(12),
    frozen: true,
    commuteMin: 40,
    postedAt: daysAgo(12),
    employerPhone: '914067221104',
  },
  {
    id: 9006,
    title: 'Pharmacist',
    company: 'Apollo Pharmacy',
    location: 'Uppal, Hyderabad',
    jobType: 'Full-time',
    tags: 'D.Pharm · Walk-in',
    salary: '₹20k–₹26k',
    initial: 'A',
    color: '#0B6E4F',
    area: 'Uppal',
    womenSafe: true,
    verifiedEmployer: true,
    gstin: '36AABCA1111C1Z3',
    lastReplyAt: daysAgo(1),
    commuteMin: 30,
    postedAt: daysAgo(1),
    walkIn: {
      date: 'Sep 8, 2026',
      time: '4:00 PM – 7:00 PM',
      venue: 'Apollo Uppal store 14',
      askFor: 'Store manager',
      bring: 'D.Pharm certificate',
    },
    employerPhone: '914067221105',
  },
  {
    id: 9007,
    title: 'Cab Driver (LMV)',
    company: 'Orbit Fleet',
    location: 'HITEC City, Hyderabad',
    jobType: 'Full-time',
    tags: 'Cab · Metro pickup',
    salary: '₹22k + fuel',
    initial: 'O',
    color: '#3D405B',
    area: 'HITEC City',
    cabProvided: true,
    nearMetro: true,
    verifiedEmployer: true,
    gstin: '36AAACO2222D1Z8',
    lastReplyAt: daysAgo(0),
    commuteMin: 12,
    postedAt: daysAgo(0),
    employerPhone: '914067221106',
  },
  {
    id: 9008,
    title: 'BPO Evening Voice',
    company: 'Conneqt',
    location: 'Gachibowli, Hyderabad',
    jobType: 'Full-time',
    tags: 'Late shift · Cab',
    salary: '₹19k–₹24k',
    initial: 'C',
    color: '#5C4D7A',
    area: 'Gachibowli',
    womenSafe: true,
    cabProvided: true,
    nearMetro: true,
    lateShift: true,
    verifiedEmployer: true,
    gstin: '36AAACC3333E1Z4',
    lastReplyAt: daysAgo(4),
    commuteMin: 20,
    postedAt: daysAgo(4),
    employerPhone: '914067221107',
  },
  {
    id: 9009,
    title: 'Tally Accountant',
    company: 'Helios Health',
    location: 'Madhapur, Hyderabad',
    jobType: 'Full-time',
    tags: 'Tally · GST',
    salary: '₹25k–₹32k',
    initial: 'H',
    color: '#16140F',
    area: 'Madhapur',
    nearMetro: true,
    verifiedEmployer: true,
    gstin: '36AAACH7788Q1Z9',
    lastReplyAt: daysAgo(1),
    commuteMin: 16,
    postedAt: daysAgo(1),
    employerPhone: '914067221102',
  },
  {
    id: 9010,
    title: 'Store Assistant',
    company: 'Local Kirana Hub',
    location: 'Secunderabad, Hyderabad',
    jobType: 'Part-time',
    tags: 'Shop · Daily',
    salary: '₹12k–₹15k',
    initial: 'L',
    color: '#8A6A1F',
    area: 'Secunderabad',
    verifiedEmployer: false,
    lastReplyAt: daysAgo(2),
    commuteMin: 35,
    postedAt: daysAgo(2),
    employerPhone: '914067221108',
  },
];

export function isGhostFrozen(job: HydJob, now = Date.now()): boolean {
  if (job.frozen) return true;
  if (!job.lastReplyAt) return false;
  return now - new Date(job.lastReplyAt).getTime() > 7 * 86400000;
}

export function walkInJobs(jobs: HydJob[] = HYD_JOBS): HydJob[] {
  return jobs.filter((job) => job.walkIn && !isGhostFrozen(job));
}
