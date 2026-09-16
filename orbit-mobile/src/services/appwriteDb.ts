import { ID, Permission, Query, Role } from 'react-native-appwrite';
import { account, APPWRITE_DATABASE_ID, APPWRITE_TABLES, tablesDB } from '../config/appwrite';
import type { EasyApply, HiringStage } from '../hyd/applications';
import { forEmployerView, persistablePhone, redactPhonesInText, sanitizeCustomerText } from '../hyd/customerSecurity';

export async function getCloudUserId(): Promise<string | null> {
  try {
    const user = await account.get();
    return user.$id;
  } catch {
    return null;
  }
}

function ownerPermissions(userId: string) {
  return [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ];
}

function asApplication(row: Record<string, unknown>): EasyApply {
  return forEmployerView({
    id: String(row.$id ?? row.id ?? ''),
    jobId: Number(row.jobId),
    jobTitle: String(row.jobTitle ?? ''),
    company: String(row.company ?? ''),
    name: String(row.name ?? ''),
    phone: persistablePhone(String(row.phone ?? '')),
    area: String(row.area ?? ''),
    lastJob: String(row.lastJob ?? ''),
    joinWhen: String(row.joinWhen ?? ''),
    voiceNote: row.voiceNote ? redactPhonesInText(String(row.voiceNote)) : undefined,
    resumeText: redactPhonesInText(String(row.resumeText ?? '')),
    appliedAt: String(row.appliedAt ?? ''),
    channel: (row.channel as EasyApply['channel']) || 'form',
    stage: (row.stage as HiringStage) || 'Applied',
  });
}

export async function listCloudApplications(userId: string): Promise<EasyApply[]> {
  const result = await tablesDB.listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: APPWRITE_TABLES.applications,
    queries: [Query.equal('userId', userId), Query.orderDesc('appliedAt'), Query.limit(100)],
  });
  return result.rows.map((row) => asApplication(row as Record<string, unknown>));
}

export async function createCloudApplication(
  userId: string,
  application: EasyApply,
): Promise<EasyApply> {
  const row = await tablesDB.createRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: APPWRITE_TABLES.applications,
    rowId: ID.unique(),
    data: {
      userId,
      jobId: application.jobId,
      jobTitle: sanitizeCustomerText(application.jobTitle, 255),
      company: sanitizeCustomerText(application.company, 255),
      name: sanitizeCustomerText(application.name, 80),
      phone: persistablePhone(application.phone),
      area: sanitizeCustomerText(application.area, 64),
      lastJob: sanitizeCustomerText(application.lastJob, 128),
      joinWhen: sanitizeCustomerText(application.joinWhen, 64),
      voiceNote: application.voiceNote ? redactPhonesInText(sanitizeCustomerText(application.voiceNote, 400)) : '',
      resumeText: redactPhonesInText(application.resumeText),
      channel: application.channel,
      stage: application.stage,
      appliedAt: application.appliedAt,
    },
    permissions: ownerPermissions(userId),
  });
  return asApplication(row as Record<string, unknown>);
}

export async function updateCloudApplicationStage(
  userId: string,
  applicationId: string,
  stage: HiringStage,
): Promise<void> {
  await tablesDB.updateRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: APPWRITE_TABLES.applications,
    rowId: applicationId,
    data: { stage },
    permissions: ownerPermissions(userId),
  });
}
