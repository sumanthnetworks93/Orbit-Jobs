import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Job } from '../types';
import {
  createCloudApplication,
  getCloudUserId,
  listCloudApplications,
  updateCloudApplicationStage,
} from '../services/appwriteDb';
import {
  persistablePhone,
  redactPhonesInText,
  sanitizeApplyFields,
  sanitizeCustomerText,
} from './customerSecurity';
import { generateResume } from './voice';

const KEY = 'orbit_hyd_applications';
const REPLY_KEY = 'orbit_hyd_replies';
const THREAD_KEY = 'orbit_hyd_threads';

export type HiringStage =
  | 'Applied'
  | 'Shortlisted'
  | 'Recruiter Review'
  | 'Phone Screen'
  | 'Interview'
  | 'Final Interview'
  | 'Offer'
  | 'Hired';

export type EasyApply = {
  id: string;
  jobId: number;
  jobTitle: string;
  company: string;
  name: string;
  phone: string;
  area: string;
  lastJob: string;
  joinWhen: string;
  voiceNote?: string;
  resumeText: string;
  appliedAt: string;
  channel: 'form' | 'voice' | 'whatsapp';
  stage: HiringStage;
};

export type ChatMessage = {
  id: string;
  applicationId: string;
  from: 'seeker' | 'employer';
  text: string;
  at: string;
};

function secureStoredApplication(item: EasyApply): EasyApply {
  return {
    ...item,
    phone: persistablePhone(item.phone),
    resumeText: redactPhonesInText(item.resumeText ?? ''),
    voiceNote: item.voiceNote ? redactPhonesInText(item.voiceNote) : undefined,
  };
}

async function getLocalApplications(): Promise<EasyApply[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as EasyApply[];
    if (!Array.isArray(parsed)) return [];
    const secured = parsed.map(secureStoredApplication);
    if (JSON.stringify(secured) !== JSON.stringify(parsed)) {
      await AsyncStorage.setItem(KEY, JSON.stringify(secured));
    }
    return secured;
  } catch {
    return [];
  }
}

export async function getApplications(): Promise<EasyApply[]> {
  const userId = await getCloudUserId();
  if (userId) {
    try {
      return await listCloudApplications(userId);
    } catch {
      // Appwrite may be paused or offline; keep applying locally.
    }
  }
  return getLocalApplications();
}

export async function submitEasyApply(input: {
  job: Job;
  name: string;
  phone: string;
  area: string;
  lastJob: string;
  joinWhen: string;
  voiceNote?: string;
  channel?: EasyApply['channel'];
}): Promise<EasyApply> {
  const cleaned = sanitizeApplyFields({
    name: input.name,
    phone: input.phone,
    area: input.area,
    lastJob: input.lastJob,
    joinWhen: input.joinWhen,
    voiceNote: input.voiceNote,
  });
  if (!cleaned.ok) {
    throw new Error(cleaned.error);
  }

  const current = await getLocalApplications();
  const storedPhone = persistablePhone(cleaned.value.phone);
  const resumeText = redactPhonesInText(
    generateResume({
      name: cleaned.value.name,
      phone: storedPhone,
      area: cleaned.value.area,
      lastJob: cleaned.value.lastJob,
      joinWhen: cleaned.value.joinWhen,
      voiceNote: cleaned.value.voiceNote,
    }),
  );
  const created: EasyApply = {
    id: `app-${Date.now()}`,
    jobId: input.job.id,
    jobTitle: sanitizeCustomerText(input.job.title, 255),
    company: sanitizeCustomerText(input.job.company, 255),
    name: cleaned.value.name,
    phone: storedPhone,
    area: cleaned.value.area,
    lastJob: cleaned.value.lastJob,
    joinWhen: cleaned.value.joinWhen,
    voiceNote: cleaned.value.voiceNote,
    resumeText,
    appliedAt: new Date().toISOString(),
    channel: input.channel ?? 'form',
    stage: 'Applied',
  };
  await AsyncStorage.setItem(KEY, JSON.stringify([created, ...current]));

  const userId = await getCloudUserId();
  if (userId) {
    try {
      return await createCloudApplication(userId, created);
    } catch {
      return created;
    }
  }
  return created;
}

export async function setApplicationStage(id: string, stage: HiringStage): Promise<void> {
  const current = await getLocalApplications();
  await AsyncStorage.setItem(
    KEY,
    JSON.stringify(current.map((item) => (item.id === id ? { ...item, stage } : item))),
  );
  const userId = await getCloudUserId();
  if (userId) {
    try {
      await updateCloudApplicationStage(userId, id, stage);
    } catch {
      // Keep the local copy if cloud write fails.
    }
  }
}

export async function markEmployerReply(jobId: number): Promise<void> {
  const raw = await AsyncStorage.getItem(REPLY_KEY);
  const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
  map[String(jobId)] = new Date().toISOString();
  await AsyncStorage.setItem(REPLY_KEY, JSON.stringify(map));
}

export async function getEmployerReplies(): Promise<Record<string, string>> {
  const raw = await AsyncStorage.getItem(REPLY_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

export async function getThread(applicationId: string): Promise<ChatMessage[]> {
  const raw = await AsyncStorage.getItem(THREAD_KEY);
  if (!raw) return [];
  try {
    const all = JSON.parse(raw) as ChatMessage[];
    return all.filter((item) => item.applicationId === applicationId);
  } catch {
    return [];
  }
}

export async function addThreadMessage(
  applicationId: string,
  from: ChatMessage['from'],
  text: string,
): Promise<ChatMessage[]> {
  const raw = await AsyncStorage.getItem(THREAD_KEY);
  const all = raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  const next: ChatMessage = {
    id: `msg-${Date.now()}`,
    applicationId,
    from,
    text,
    at: new Date().toISOString(),
  };
  const merged = [...all, next];
  await AsyncStorage.setItem(THREAD_KEY, JSON.stringify(merged));
  return merged.filter((item) => item.applicationId === applicationId);
}
