export type ApplyFields = {
  name: string;
  phone: string;
  area: string;
  lastJob: string;
  joinWhen: string;
  voiceNote?: string;
};

export function sanitizeCustomerText(value: string, max: number): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export function normalizeIndianMobile(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export function isValidIndianMobile(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(normalizeIndianMobile(phone));
}

export function maskCustomerPhone(phone: string): string {
  if (/[*•]/.test(phone)) return phone.trim() || '**********';
  const digits = normalizeIndianMobile(phone);
  if (digits.length !== 10) return '**********';
  return `${digits.slice(0, 3)}****${digits.slice(-3)}`;
}

const RAW_MOBILE = /(?:\+91[-\s]?|91[-\s]?)?[6-9]\d{9}/g;

export function redactPhonesInText(text: string): string {
  return text.replace(RAW_MOBILE, (match) => maskCustomerPhone(match));
}

export function sanitizeApplyFields(
  input: ApplyFields,
): { ok: true; value: ApplyFields } | { ok: false; error: string } {
  const name = sanitizeCustomerText(input.name, 80);
  const area = sanitizeCustomerText(input.area, 64);
  const lastJob = sanitizeCustomerText(input.lastJob, 128);
  const joinWhen = sanitizeCustomerText(input.joinWhen, 64);
  const voiceNote = input.voiceNote
    ? sanitizeCustomerText(input.voiceNote, 400)
    : undefined;
  const phone = normalizeIndianMobile(input.phone);

  if (name.length < 2) return { ok: false, error: 'Enter your name.' };
  if (!isValidIndianMobile(phone)) {
    return { ok: false, error: 'Enter a valid 10-digit Indian mobile number.' };
  }
  if (area.length < 2) return { ok: false, error: 'Enter your area.' };
  if (lastJob.length < 2) return { ok: false, error: 'Enter your last job.' };
  if (joinWhen.length < 2) return { ok: false, error: 'Enter when you can join.' };

  return {
    ok: true,
    value: {
      name,
      phone,
      area,
      lastJob,
      joinWhen,
      voiceNote: voiceNote || undefined,
    },
  };
}

export function persistablePhone(phone: string): string {
  return maskCustomerPhone(phone);
}

export function forEmployerView<T extends { phone: string; resumeText?: string; voiceNote?: string }>(
  record: T,
): T {
  return {
    ...record,
    phone: maskCustomerPhone(record.phone),
    resumeText: record.resumeText ? redactPhonesInText(record.resumeText) : record.resumeText,
    voiceNote: record.voiceNote ? redactPhonesInText(record.voiceNote) : record.voiceNote,
  };
}
