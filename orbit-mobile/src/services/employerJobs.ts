import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPlatformControlsSync } from './adminControl';

export type EmployerListing = {
  id: string;
  title: string;
  location: string;
  jobType: string;
  salary: string;
  tags: string;
  applicants: number;
  status: 'open' | 'paused';
  postedAt: string;
};

export type EmployerApplicant = {
  id: string;
  name: string;
  role: string;
  note: string;
  appliedAt: string;
};

const LISTINGS_KEY = 'orbit_employer_listings';

const SEED_LISTINGS: EmployerListing[] = [
  {
    id: 'el-1',
    title: 'Founding Engineer',
    location: 'Remote · US',
    jobType: 'Full-time',
    salary: '$160k–$190k',
    tags: 'TypeScript · React',
    applicants: 12,
    status: 'open',
    postedAt: '2d ago',
  },
  {
    id: 'el-2',
    title: 'Product Designer',
    location: 'Hyderabad',
    jobType: 'Full-time',
    salary: '₹28L–₹36L',
    tags: 'Figma · Product',
    applicants: 7,
    status: 'open',
    postedAt: '5d ago',
  },
];

const SEED_APPLICANTS: EmployerApplicant[] = [
  { id: 'ea-1', name: 'Arjun Rao', role: 'Founding Engineer', note: 'Shipped 0→1 at two startups.', appliedAt: 'Today' },
  { id: 'ea-2', name: 'Priya Nair', role: 'Product Designer', note: '4 years consumer product.', appliedAt: 'Yesterday' },
  { id: 'ea-3', name: 'Sam Okonkwo', role: 'Founding Engineer', note: 'Backend + infra, looking remote.', appliedAt: '2d ago' },
];

export async function getEmployerListings(): Promise<EmployerListing[]> {
  try {
    const raw = await AsyncStorage.getItem(LISTINGS_KEY);
    if (!raw) {
      await AsyncStorage.setItem(LISTINGS_KEY, JSON.stringify(SEED_LISTINGS));
      return SEED_LISTINGS;
    }
    return JSON.parse(raw) as EmployerListing[];
  } catch {
    return SEED_LISTINGS;
  }
}

export async function addEmployerListing(input: Omit<EmployerListing, 'id' | 'applicants' | 'status' | 'postedAt'>): Promise<EmployerListing> {
  const listings = await getEmployerListings();
  const created: EmployerListing = {
    ...input,
    id: `el-${Date.now()}`,
    applicants: 0,
    status: getPlatformControlsSync().jobReviewRequired ? 'paused' : 'open',
    postedAt: 'Just now',
  };
  await AsyncStorage.setItem(LISTINGS_KEY, JSON.stringify([created, ...listings]));
  return created;
}

export function getEmployerApplicants(): EmployerApplicant[] {
  return SEED_APPLICANTS;
}
