import AsyncStorage from '@react-native-async-storage/async-storage';

export type PlatformControls = {
  guestApply: boolean;
  jobReviewRequired: boolean;
  whatsappRelay: boolean;
  autoFreezeGhosts: boolean;
  maintenance: boolean;
};

export type PlatformControlKey = keyof PlatformControls;

export const DEFAULT_PLATFORM_CONTROLS: PlatformControls = {
  guestApply: true,
  jobReviewRequired: false,
  whatsappRelay: true,
  autoFreezeGhosts: true,
  maintenance: false,
};

export const PLATFORM_CONTROL_FIELDS: {
  key: PlatformControlKey;
  label: string;
  helper: string;
}[] = [
  {
    key: 'guestApply',
    label: 'Guest apply',
    helper: 'Guests can send the 6-field apply without signing in.',
  },
  {
    key: 'whatsappRelay',
    label: 'WhatsApp relay',
    helper: 'Show Orbit WhatsApp on job cards and apply sheets.',
  },
  {
    key: 'jobReviewRequired',
    label: 'Review new job posts',
    helper: 'Employer listings wait for review before they go live.',
  },
  {
    key: 'autoFreezeGhosts',
    label: 'Auto-freeze silent recruiters',
    helper: 'Hide jobs with no recruiter reply for 7 days.',
  },
  {
    key: 'maintenance',
    label: 'Maintenance mode',
    helper: 'Show a maintenance banner on the seeker feed.',
  },
];

const KEY = 'orbit_admin_controls';

let cache: PlatformControls = { ...DEFAULT_PLATFORM_CONTROLS };

function normalize(raw: Partial<PlatformControls> | null | undefined): PlatformControls {
  return { ...DEFAULT_PLATFORM_CONTROLS, ...raw };
}

export function getPlatformControlsSync(): PlatformControls {
  return cache;
}

export function setPlatformControlsSync(next: PlatformControls) {
  cache = normalize(next);
  return cache;
}

export async function getPlatformControls(): Promise<PlatformControls> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    cache = raw ? normalize(JSON.parse(raw) as Partial<PlatformControls>) : { ...DEFAULT_PLATFORM_CONTROLS };
    return cache;
  } catch {
    cache = { ...DEFAULT_PLATFORM_CONTROLS };
    return cache;
  }
}

export async function hydratePlatformControls(): Promise<PlatformControls> {
  return getPlatformControls();
}

export async function setPlatformControl(
  key: PlatformControlKey,
  value: boolean,
): Promise<PlatformControls> {
  const next = { ...cache, [key]: value };
  cache = next;
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function isWhatsAppRelayEnabled() {
  return getPlatformControlsSync().whatsappRelay;
}

export function isGuestApplyEnabled() {
  return getPlatformControlsSync().guestApply;
}
