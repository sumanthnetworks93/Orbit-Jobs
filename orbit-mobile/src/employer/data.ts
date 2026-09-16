export type JobStatus = 'Active' | 'Draft' | 'Paused' | 'Closed';
export type WorkType = 'Remote' | 'Hybrid' | 'On-site';
export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
export type HiringStage =
  | 'Shortlisted'
  | 'Recruiter Review'
  | 'Phone Screen'
  | 'Interview'
  | 'Final Interview'
  | 'Offer'
  | 'Hired';

export type ApplicantStatus = 'Excellent Match' | 'Strong Match' | 'Potential Match' | 'Review';

export type EmployerJob = {
  id: string;
  title: string;
  location: string;
  workType: WorkType;
  employmentType: EmploymentType;
  postedAt: string;
  postedDaysAgo: number;
  applicants: number;
  shortlisted: number;
  status: JobStatus;
};

export type Candidate = {
  id: string;
  name: string;
  title: string;
  match: number;
  experience: number;
  skills: string[];
  location: string;
  applied: string;
  jobId: string;
  shortlisted: boolean;
  stage: HiringStage | null;
  education: string;
  industry: string;
    availability: string;
    linkedin?: string;
    portfolio?: string;
    resumeUrl?: string;
    summary: string;
  why: string[];
  matchedSkills: string[];
  missingSkills: string[];
  experienceNotes: string;
  projects: string;
};

export const HIRING_STAGES: HiringStage[] = [
  'Shortlisted',
  'Recruiter Review',
  'Phone Screen',
  'Interview',
  'Final Interview',
  'Offer',
  'Hired',
];

export const JOBS: EmployerJob[] = [
  {
    id: 'job-analyst',
    title: 'Financial Analyst',
    location: 'Phoenix, AZ',
    workType: 'Hybrid',
    employmentType: 'Full-time',
    postedAt: 'Sep 5, 2026',
    postedDaysAgo: 3,
    applicants: 42,
    shortlisted: 8,
    status: 'Active',
  },
  {
    id: 'job-fpna',
    title: 'FP&A Manager',
    location: 'Austin, TX',
    workType: 'Hybrid',
    employmentType: 'Full-time',
    postedAt: 'Sep 1, 2026',
    postedDaysAgo: 7,
    applicants: 31,
    shortlisted: 6,
    status: 'Active',
  },
  {
    id: 'job-intern',
    title: 'Finance Intern',
    location: 'Remote',
    workType: 'Remote',
    employmentType: 'Internship',
    postedAt: 'Aug 28, 2026',
    postedDaysAgo: 11,
    applicants: 64,
    shortlisted: 4,
    status: 'Active',
  },
  {
    id: 'job-controller',
    title: 'Assistant Controller',
    location: 'Dallas, TX',
    workType: 'On-site',
    employmentType: 'Full-time',
    postedAt: 'Aug 20, 2026',
    postedDaysAgo: 19,
    applicants: 27,
    shortlisted: 3,
    status: 'Active',
  },
  {
    id: 'job-contract',
    title: 'Revenue Analyst',
    location: 'Chicago, IL',
    workType: 'Remote',
    employmentType: 'Contract',
    postedAt: 'Aug 12, 2026',
    postedDaysAgo: 27,
    applicants: 18,
    shortlisted: 2,
    status: 'Active',
  },
  {
    id: 'job-staff',
    title: 'Staff Accountant',
    location: 'Phoenix, AZ',
    workType: 'Hybrid',
    employmentType: 'Full-time',
    postedAt: 'Sep 3, 2026',
    postedDaysAgo: 5,
    applicants: 2,
    shortlisted: 0,
    status: 'Active',
  },
  {
    id: 'job-draft',
    title: 'Healthcare FP&A Lead',
    location: 'Phoenix, AZ',
    workType: 'Hybrid',
    employmentType: 'Full-time',
    postedAt: 'Draft',
    postedDaysAgo: 0,
    applicants: 0,
    shortlisted: 0,
    status: 'Draft',
  },
  {
    id: 'job-treasury',
    title: 'Treasury Analyst',
    location: 'Denver, CO',
    workType: 'Hybrid',
    employmentType: 'Full-time',
    postedAt: 'Aug 10, 2026',
    postedDaysAgo: 29,
    applicants: 0,
    shortlisted: 0,
    status: 'Paused',
  },
  {
    id: 'job-tax',
    title: 'Tax Analyst',
    location: 'Phoenix, AZ',
    workType: 'On-site',
    employmentType: 'Full-time',
    postedAt: 'Jul 22, 2026',
    postedDaysAgo: 48,
    applicants: 0,
    shortlisted: 0,
    status: 'Closed',
  },
];

export const CANDIDATES: Candidate[] = [
  {
    id: 'c-alex',
    name: 'Alex Johnson',
    title: 'Financial Analyst',
    match: 92,
    experience: 4,
    skills: ['Excel', 'SQL', 'Power BI'],
    location: 'Phoenix, AZ',
    applied: '2 hours ago',
    jobId: 'job-analyst',
    shortlisted: true,
    stage: 'Interview',
    education: 'B.S. Finance, Arizona State',
    industry: 'Healthcare',
    availability: '2 weeks',
    linkedin: 'linkedin.com/in/alexjohnson',
    resumeUrl: 'Resume.pdf',
    summary: 'Built monthly forecasts and variance packs for a regional hospital network.',
    why: [
      '4 years of financial analysis experience',
      'Advanced Excel experience',
      'Experience creating financial models',
      'Strong forecasting and budgeting background',
      'Healthcare industry experience',
    ],
    matchedSkills: ['Excel', 'SQL', 'Forecasting', 'Financial Modeling'],
    missingSkills: ['Power BI'],
    experienceNotes: 'Helios-adjacent clinic group · FP&A rotation + close support.',
    projects: 'Driver-based forecast model that cut close time by 1.5 days.',
  },
  {
    id: 'c-priya',
    name: 'Priya Nair',
    title: 'FP&A Associate',
    match: 88,
    experience: 5,
    skills: ['Excel', 'Forecasting', 'Financial Modeling'],
    location: 'Scottsdale, AZ',
    applied: 'Yesterday',
    jobId: 'job-analyst',
    shortlisted: true,
    stage: 'Phone Screen',
    education: 'MBA, Thunderbird',
    industry: 'Healthcare',
    availability: 'Immediate',
    summary: 'Owns budgeting, forecasting, and board variance commentary.',
    why: ['5 years FP&A', 'Forecasting and variance analysis', 'Healthcare finance'],
    matchedSkills: ['Excel', 'Forecasting', 'Financial Modeling', 'Healthcare'],
    missingSkills: ['SQL'],
    experienceNotes: 'Health system FP&A, $400M operating budget.',
    projects: 'Zero-based budget rollout across 3 service lines.',
  },
  {
    id: 'c-jordan',
    name: 'Jordan Hale',
    title: 'Business Analyst',
    match: 81,
    experience: 3,
    skills: ['Excel', 'SQL', 'Tableau'],
    location: 'Tempe, AZ',
    applied: '2 days ago',
    jobId: 'job-analyst',
    shortlisted: true,
    stage: 'Shortlisted',
    education: 'B.S. Economics, U of A',
    industry: 'SaaS',
    availability: '30 days',
    summary: 'Strong modeling; limited healthcare exposure.',
    why: ['SQL and Excel fluency', 'Dashboarding', '3 years analysis'],
    matchedSkills: ['Excel', 'SQL'],
    missingSkills: ['Healthcare', 'Power BI'],
    experienceNotes: 'B2B SaaS revenue ops.',
    projects: 'Cohort retention model for finance and CS.',
  },
  {
    id: 'c-mei',
    name: 'Mei Chen',
    title: 'Senior Accountant',
    match: 74,
    experience: 6,
    skills: ['Excel', 'NetSuite', 'Forecasting'],
    location: 'Remote',
    applied: '3 days ago',
    jobId: 'job-analyst',
    shortlisted: false,
    stage: null,
    education: 'B.S. Accounting',
    industry: 'Healthcare',
    availability: '3 weeks',
    summary: 'Close-heavy profile with emerging FP&A work.',
    why: ['Healthcare accounting', 'Forecast support'],
    matchedSkills: ['Excel', 'Forecasting', 'Healthcare'],
    missingSkills: ['SQL', 'Power BI'],
    experienceNotes: 'Hospital controller team.',
    projects: 'Standardized month-end checklist.',
  },
  {
    id: 'c-diego',
    name: 'Diego Alvarez',
    title: 'Data Analyst',
    match: 67,
    experience: 2,
    skills: ['SQL', 'Python', 'Excel'],
    location: 'Phoenix, AZ',
    applied: '4 days ago',
    jobId: 'job-analyst',
    shortlisted: false,
    stage: null,
    education: 'B.S. Statistics',
    industry: 'Retail',
    availability: 'Immediate',
    summary: 'Technical analyst, light finance domain.',
    why: ['SQL depth', 'Local to Phoenix'],
    matchedSkills: ['SQL', 'Excel'],
    missingSkills: ['Financial Modeling', 'Healthcare'],
    experienceNotes: 'Retail merchandising analytics.',
    projects: 'Promo lift model.',
  },
  {
    id: 'c-sam',
    name: 'Sam Okonkwo',
    title: 'Investment Analyst',
    match: 58,
    experience: 3,
    skills: ['Excel', 'PowerPoint'],
    location: 'New York, NY',
    applied: '5 days ago',
    jobId: 'job-analyst',
    shortlisted: false,
    stage: null,
    education: 'B.S. Finance',
    industry: 'Banking',
    availability: '60 days',
    summary: 'Markets background; weaker operational FP&A.',
    why: ['Excel modeling'],
    matchedSkills: ['Excel'],
    missingSkills: ['SQL', 'Healthcare', 'Power BI'],
    experienceNotes: 'IB coverage analyst.',
    projects: 'Comps and CIM support.',
  },
  {
    id: 'c-lena',
    name: 'Lena Ortiz',
    title: 'FP&A Manager',
    match: 91,
    experience: 7,
    skills: ['Excel', 'Financial Modeling', 'Healthcare'],
    location: 'Austin, TX',
    applied: '6 hours ago',
    jobId: 'job-fpna',
    shortlisted: true,
    stage: 'Final Interview',
    education: 'MBA, UT Austin',
    industry: 'Healthcare',
    availability: '3 weeks',
    linkedin: 'linkedin.com/in/lenaortiz',
    summary: 'Leads FP&A for a 12-hospital region.',
    why: ['Healthcare FP&A leadership', 'Board-level forecasting'],
    matchedSkills: ['Excel', 'Financial Modeling', 'Healthcare'],
    missingSkills: ['Power BI'],
    experienceNotes: 'Regional health system FP&A.',
    projects: 'Service-line profitability model.',
  },
  {
    id: 'c-noah',
    name: 'Noah Patel',
    title: 'Revenue Analyst',
    match: 79,
    experience: 4,
    skills: ['SQL', 'Excel', 'Forecasting'],
    location: 'Chicago, IL',
    applied: '1 day ago',
    jobId: 'job-contract',
    shortlisted: true,
    stage: 'Recruiter Review',
    education: 'B.S. Finance',
    industry: 'Healthcare',
    availability: 'Immediate',
    summary: 'Revenue integrity and payer mix analysis.',
    why: ['Revenue analytics', 'SQL + Excel'],
    matchedSkills: ['SQL', 'Excel', 'Forecasting'],
    missingSkills: ['Power BI'],
    experienceNotes: 'Payer analytics team.',
    projects: 'Denial-rate forecast.',
  },
];

export const INTERVIEWS = [
  { id: 'i1', name: 'Alex Johnson', role: 'Financial Analyst', when: 'Wed 10:00 AM', stage: 'Interview' },
  { id: 'i2', name: 'Priya Nair', role: 'Financial Analyst', when: 'Wed 2:00 PM', stage: 'Phone Screen' },
  { id: 'i3', name: 'Lena Ortiz', role: 'FP&A Manager', when: 'Thu 11:00 AM', stage: 'Final Interview' },
  { id: 'i4', name: 'Jordan Hale', role: 'Financial Analyst', when: 'Thu 3:30 PM', stage: 'Interview' },
  { id: 'i5', name: 'Mei Chen', role: 'Financial Analyst', when: 'Fri 9:30 AM', stage: 'Phone Screen' },
  { id: 'i6', name: 'Noah Patel', role: 'Revenue Analyst', when: 'Fri 1:00 PM', stage: 'Interview' },
  { id: 'i7', name: 'Diego Alvarez', role: 'Financial Analyst', when: 'Mon 10:00 AM', stage: 'Phone Screen' },
  { id: 'i8', name: 'Sam Okonkwo', role: 'Financial Analyst', when: 'Mon 4:00 PM', stage: 'Recruiter Review' },
];

export const SKILL_SHARE = [
  { name: 'Excel', pct: 86 },
  { name: 'SQL', pct: 71 },
  { name: 'Financial Modeling', pct: 68 },
  { name: 'Power BI', pct: 54 },
  { name: 'Forecasting', pct: 49 },
  { name: 'Healthcare', pct: 32 },
];

export const MISSING_SKILLS = ['Healthcare Finance', 'Power BI', 'FP&A Experience'];

export const AI_INSIGHTS = [
  'Most applicants have strong Excel and financial analysis experience, but only 32% have healthcare industry experience.',
  '12 candidates match more than 85% of the required skills.',
  '8 applicants have experience with financial forecasting, budgeting, and variance analysis.',
  '4 candidates appear interview-ready based on experience and skill alignment.',
];

export const QUALITY = [
  { label: 'Excellent Match', count: 8, tone: 'excellent' as const },
  { label: 'Good Match', count: 15, tone: 'strong' as const },
  { label: 'Moderate Match', count: 12, tone: 'potential' as const },
  { label: 'Low Match', count: 7, tone: 'review' as const },
];

export function matchLabel(score: number): ApplicantStatus {
  if (score >= 90) return 'Excellent Match';
  if (score >= 75) return 'Strong Match';
  if (score >= 60) return 'Potential Match';
  return 'Review';
}

export function greeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
