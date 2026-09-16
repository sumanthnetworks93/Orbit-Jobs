import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const DATABASE_ID = 'orbit';
const DATABASE_NAME = 'Orbit';

function varchar(key, size, required = false) {
  return { key, type: 'varchar', required, array: false, size, status: 'available', error: '', default: null };
}

function text(key, required = false) {
  return { key, type: 'text', required, array: false, status: 'available', error: '' };
}

function bool(key, fallback = false) {
  return { key, type: 'boolean', required: false, array: false, status: 'available', error: '', default: fallback };
}

function integer(key, required = false) {
  return { key, type: 'integer', required, array: false, status: 'available', error: '', default: null };
}

function datetime(key) {
  return { key, type: 'datetime', required: false, array: false, status: 'available', error: '', default: null };
}

function enumerated(key, elements, fallback = null) {
  return {
    key,
    type: 'string',
    format: 'enum',
    elements,
    required: false,
    array: false,
    default: fallback,
    status: 'available',
    error: '',
  };
}

function url(key) {
  return { key, type: 'string', format: 'url', required: false, array: false, status: 'available', error: '', default: null };
}

function email(key) {
  return { key, type: 'string', format: 'email', required: false, array: false, status: 'available', error: '', default: null };
}

function index(key, type, attributes, orders) {
  return {
    key,
    type,
    status: 'available',
    error: '',
    attributes,
    orders: orders ?? attributes.map(() => 'ASC'),
  };
}

const TABLES = [
  {
    $id: 'jobs',
    name: 'Jobs',
    $permissions: ['read("any")', 'create("users")'],
    rowSecurity: true,
    columns: [
      integer('jobId', true),
      varchar('title', 255, true),
      varchar('company', 255, true),
      varchar('location', 255, true),
      varchar('area', 64),
      varchar('jobType', 64),
      varchar('tags', 512),
      varchar('salary', 64),
      varchar('initial', 8),
      varchar('color', 16),
      url('sourceUrl'),
      bool('womenSafe'),
      bool('cabProvided'),
      bool('nearMetro'),
      bool('lateShift'),
      bool('verifiedEmployer'),
      bool('frozen'),
      integer('commuteMin'),
      varchar('walkInDate', 64),
      varchar('walkInTime', 64),
      varchar('walkInVenue', 255),
      varchar('walkInAskFor', 128),
      varchar('walkInBring', 255),
      varchar('employerPhone', 20),
      varchar('gstin', 32),
      datetime('lastReplyAt'),
      integer('startupId'),
      varchar('externalKey', 128),
      varchar('ownerId', 36),
      enumerated('status', ['open', 'paused', 'closed'], 'open'),
    ],
    indexes: [
      index('idx_job_id', 'unique', ['jobId']),
      index('idx_external_key', 'unique', ['externalKey']),
      index('idx_area', 'key', ['area']),
      index('idx_location', 'key', ['location']),
      index('idx_job_type', 'key', ['jobType']),
      index('idx_status', 'key', ['status']),
      index('idx_verified', 'key', ['verifiedEmployer']),
      index('idx_walkin', 'key', ['walkInDate']),
      index('idx_owner', 'key', ['ownerId']),
      index('idx_search', 'fulltext', ['title', 'company', 'tags']),
    ],
  },
  {
    $id: 'startups',
    name: 'Startups',
    $permissions: ['read("any")', 'create("users")'],
    rowSecurity: true,
    columns: [
      integer('startupId', true),
      varchar('name', 255, true),
      text('description'),
      varchar('category', 64),
      integer('openRoles'),
      integer('upvotes'),
      varchar('initial', 8),
      varchar('color', 16),
      varchar('externalKey', 128),
      url('sourceUrl'),
    ],
    indexes: [
      index('idx_startup_id', 'unique', ['startupId']),
      index('idx_startup_external', 'unique', ['externalKey']),
      index('idx_category', 'key', ['category']),
      index('idx_startup_search', 'fulltext', ['name', 'description']),
    ],
  },
  {
    $id: 'applications',
    name: 'Applications',
    $permissions: ['create("users")'],
    rowSecurity: true,
    columns: [
      varchar('userId', 36, true),
      integer('jobId', true),
      varchar('jobTitle', 255, true),
      varchar('company', 255, true),
      varchar('name', 128, true),
      // Store masked mobiles only (e.g. 987****210). Never persist a raw 10-digit number.
      varchar('phone', 20, true),
      varchar('area', 64),
      varchar('lastJob', 128),
      varchar('joinWhen', 64),
      text('voiceNote'),
      text('resumeText'),
      enumerated('channel', ['form', 'voice', 'whatsapp'], 'form'),
      enumerated('stage', [
        'Applied',
        'Shortlisted',
        'Recruiter Review',
        'Phone Screen',
        'Interview',
        'Final Interview',
        'Offer',
        'Hired',
      ], 'Applied'),
      datetime('appliedAt'),
    ],
    indexes: [
      index('idx_user_job', 'unique', ['userId', 'jobId']),
      index('idx_app_user', 'key', ['userId']),
      index('idx_app_job', 'key', ['jobId']),
      index('idx_app_stage', 'key', ['stage']),
      index('idx_applied_at', 'key', ['appliedAt'], ['DESC']),
    ],
  },
  {
    $id: 'messages',
    name: 'Messages',
    $permissions: ['create("users")'],
    rowSecurity: true,
    columns: [
      varchar('applicationId', 36, true),
      enumerated('sender', ['seeker', 'employer'], 'seeker'),
      text('text', true),
      datetime('sentAt'),
    ],
    indexes: [
      index('idx_msg_application', 'key', ['applicationId']),
      index('idx_msg_sent', 'key', ['sentAt'], ['DESC']),
    ],
  },
  {
    $id: 'profiles',
    name: 'Profiles',
    $permissions: ['create("users")'],
    rowSecurity: true,
    columns: [
      varchar('userId', 36, true),
      varchar('displayName', 128),
      varchar('phone', 20),
      email('email'),
      varchar('area', 64),
      varchar('lastJob', 128),
      varchar('canJoinWhen', 64),
      text('voiceResume'),
      enumerated('lang', ['en', 'te'], 'en'),
      enumerated('role', ['seeker', 'employer', 'admin'], 'seeker'),
      varchar('company', 128),
      bool('notifications', true),
    ],
    indexes: [
      index('idx_profile_user', 'unique', ['userId']),
      index('idx_profile_role', 'key', ['role']),
      index('idx_profile_area', 'key', ['area']),
    ],
  },
  {
    $id: 'saved_startups',
    name: 'Saved startups',
    $permissions: ['create("users")'],
    rowSecurity: true,
    columns: [
      varchar('userId', 36, true),
      integer('startupId', true),
    ],
    indexes: [
      index('idx_saved_user_startup', 'unique', ['userId', 'startupId']),
      index('idx_saved_user', 'key', ['userId']),
    ],
  },
];

function cliConfig(projectId, endpoint) {
  return {
    projectId,
    endpoint,
    tablesDB: [{ $id: DATABASE_ID, name: DATABASE_NAME, enabled: true }],
    tables: TABLES.map((table) => ({
      $id: table.$id,
      $permissions: table.$permissions,
      databaseId: DATABASE_ID,
      name: table.name,
      enabled: true,
      rowSecurity: table.rowSecurity,
      columns: table.columns,
      indexes: table.indexes,
    })),
  };
}

function columnPayload(column) {
  const base = { key: column.key, required: Boolean(column.required), array: Boolean(column.array) };
  if (column.default !== undefined && column.default !== null && !column.required) {
    base.default = column.default;
  }
  if (column.type === 'varchar') return { path: 'varchar', body: { ...base, size: column.size } };
  if (column.type === 'text') return { path: 'text', body: base };
  if (column.type === 'boolean') return { path: 'boolean', body: base };
  if (column.type === 'integer') return { path: 'integer', body: base };
  if (column.type === 'datetime') return { path: 'datetime', body: base };
  if (column.format === 'enum') return { path: 'enum', body: { ...base, elements: column.elements } };
  if (column.format === 'url') return { path: 'url', body: base };
  if (column.format === 'email') return { path: 'email', body: base };
  throw new Error(`Unsupported column ${column.key}`);
}

async function loadSecrets() {
  const envPath = join(rootDir, '.env');
  try {
    const raw = await readFile(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!match || process.env[match[1]]) continue;
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  } catch {
    // optional local env
  }

  if (!process.env.APPWRITE_API_KEY) {
    try {
      const mcp = JSON.parse(
        await readFile(join(rootDir, '..', '.cursor', 'mcp.json'), 'utf8'),
      );
      const env = mcp.mcpServers?.['appwrite-api']?.env ?? {};
      process.env.APPWRITE_API_KEY ??= env.APPWRITE_API_KEY;
      process.env.APPWRITE_PROJECT_ID ??= env.APPWRITE_PROJECT_ID;
      process.env.APPWRITE_ENDPOINT ??= env.APPWRITE_ENDPOINT;
    } catch {
      // optional MCP fallback
    }
  }

  return {
    endpoint: (process.env.APPWRITE_ENDPOINT || process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1').replace(/\/$/, ''),
    projectId: process.env.APPWRITE_PROJECT_ID || process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '',
    apiKey: process.env.APPWRITE_API_KEY || '',
  };
}

async function api(secrets, method, path, body) {
  const res = await fetch(`${secrets.endpoint}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Appwrite-Project': secrets.projectId,
      'X-Appwrite-Key': secrets.apiKey,
      'X-Appwrite-Response-Format': '1.8.0',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  return { ok: res.ok, status: res.status, data };
}

function exists({ status, data }) {
  return status === 409 || data.type === 'document_already_exists' || /already exists/i.test(data.message ?? '');
}

async function waitForColumn(secrets, tableId, key) {
  for (let i = 0; i < 20; i += 1) {
    const result = await api(
      secrets,
      'GET',
      `/tablesdb/${DATABASE_ID}/tables/${tableId}/columns/${key}`,
    );
    if (result.data?.status === 'available') return;
    if (result.status === 404) return;
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
}

async function provision(secrets) {
  const created = await api(secrets, 'POST', '/tablesdb', {
    databaseId: DATABASE_ID,
    name: DATABASE_NAME,
    enabled: true,
  });
  if (!created.ok && !exists(created)) {
    throw new Error(created.data.message || `Create database failed (${created.status})`);
  }

  for (const table of TABLES) {
    const tableResult = await api(secrets, 'POST', `/tablesdb/${DATABASE_ID}/tables`, {
      tableId: table.$id,
      name: table.name,
      permissions: table.$permissions,
      rowSecurity: table.rowSecurity,
      enabled: true,
    });
    if (!tableResult.ok && !exists(tableResult)) {
      throw new Error(`${table.$id}: ${tableResult.data.message || tableResult.status}`);
    }

    for (const column of table.columns) {
      const { path, body } = columnPayload(column);
      const columnResult = await api(
        secrets,
        'POST',
        `/tablesdb/${DATABASE_ID}/tables/${table.$id}/columns/${path}`,
        body,
      );
      if (!columnResult.ok && !exists(columnResult)) {
        throw new Error(`${table.$id}.${column.key}: ${columnResult.data.message || columnResult.status}`);
      }
      await waitForColumn(secrets, table.$id, column.key);
    }

    for (const item of table.indexes) {
      const indexResult = await api(
        secrets,
        'POST',
        `/tablesdb/${DATABASE_ID}/tables/${table.$id}/indexes`,
        {
          key: item.key,
          type: item.type,
          columns: item.attributes,
          orders: item.orders,
        },
      );
      if (!indexResult.ok && !exists(indexResult)) {
        throw new Error(`${table.$id} index ${item.key}: ${indexResult.data.message || indexResult.status}`);
      }
    }
    console.log(`Ready: ${table.$id}`);
  }
}

async function main() {
  const secrets = await loadSecrets();
  const configPath = join(rootDir, 'appwrite.config.json');
  await writeFile(
    configPath,
    `${JSON.stringify(cliConfig(secrets.projectId || '<PROJECT_ID>', secrets.endpoint), null, 2)}\n`,
  );
  console.log(`Wrote ${configPath}`);

  if (!secrets.projectId || !secrets.apiKey) {
    throw new Error('Set APPWRITE_PROJECT_ID and APPWRITE_API_KEY, then re-run.');
  }

  const health = await api(secrets, 'GET', '/tablesdb');
  if (health.data?.type === 'project_paused') {
    throw new Error(
      'Appwrite project is paused. Restore it in the console (Settings → Restore), then run npm run appwrite:provision.',
    );
  }
  if (!health.ok && health.status !== 404) {
    throw new Error(health.data.message || `Appwrite error ${health.status}`);
  }

  await provision(secrets);
  console.log('Appwrite TablesDB is provisioned: jobs, startups, applications, messages, profiles, saved_startups.');
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
