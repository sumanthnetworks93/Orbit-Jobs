import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  isValidIndianMobile,
  maskCustomerPhone,
  persistablePhone,
  sanitizeCustomerText,
} from '../hyd/customerSecurity';
import { generateResume } from '../hyd/voice';

const KEY = 'orbit_simple_resume';

export type SimpleResumeDraft = {
  name: string;
  phone: string;
  area: string;
  lastJob: string;
  joinWhen: string;
  education: string;
  skills: string;
};

export type SimpleResume = SimpleResumeDraft & {
  text: string;
  updatedAt: string;
};

export const EMPTY_RESUME_DRAFT: SimpleResumeDraft = {
  name: '',
  phone: '',
  area: '',
  lastJob: '',
  joinWhen: '',
  education: '',
  skills: '',
};

export function previewSimpleResume(draft: SimpleResumeDraft): string {
  return generateResume({
    name: draft.name.trim() || 'Your name',
    phone: draft.phone,
    area: draft.area.trim() || 'Hyderabad',
    lastJob: draft.lastJob.trim() || 'Previous local role',
    joinWhen: draft.joinWhen.trim() || 'In 7 days',
    education: draft.education,
    skills: draft.skills,
  });
}

export async function getSavedResume(): Promise<SimpleResume | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SimpleResume;
    if (!parsed?.name || !parsed?.text) return null;
    return {
      ...EMPTY_RESUME_DRAFT,
      ...parsed,
      phone: parsed.phone ? persistablePhone(parsed.phone) : '',
    };
  } catch {
    return null;
  }
}

export async function saveSimpleResume(draft: SimpleResumeDraft): Promise<SimpleResume> {
  const name = sanitizeCustomerText(draft.name, 80);
  const area = sanitizeCustomerText(draft.area, 64);
  const lastJob = sanitizeCustomerText(draft.lastJob, 128);
  const joinWhen = sanitizeCustomerText(draft.joinWhen, 64);
  const education = sanitizeCustomerText(draft.education, 80);
  const skills = sanitizeCustomerText(draft.skills, 120);
  const phone = draft.phone.trim();

  if (name.length < 2) throw new Error('Enter your name.');
  if (area.length < 2) throw new Error('Enter your area or district.');
  if (lastJob.length < 2) throw new Error('Enter your last job.');
  if (joinWhen.length < 2) throw new Error('Enter when you can join.');
  if (phone && !/[*•]/.test(phone) && !isValidIndianMobile(phone)) {
    throw new Error('Enter a valid 10-digit Indian mobile number.');
  }

  const saved: SimpleResume = {
    name,
    phone: phone ? persistablePhone(phone) : '',
    area,
    lastJob,
    joinWhen,
    education,
    skills,
    text: generateResume({
      name,
      phone: phone ? maskCustomerPhone(phone) : '',
      area,
      lastJob,
      joinWhen,
      education,
      skills,
    }),
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(saved));
  return saved;
}
