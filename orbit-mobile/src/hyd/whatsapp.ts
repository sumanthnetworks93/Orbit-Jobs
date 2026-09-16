const RELAY_E164 = '914067001234';

export function maskPhone(real?: string | null): string {
  const digits = (real ?? RELAY_E164).replace(/\D/g, '');
  const last = digits.slice(-2);
  return `Orbit relay +91 40 •••• ••${last}`;
}

export function whatsappUrl(jobTitle: string, company: string, candidateName?: string): string {
  const text = encodeURIComponent(
    `Hi ${company}, I am applying for ${jobTitle} via Orbit.${candidateName ? ` My name is ${candidateName}.` : ''} Please reply on this Orbit thread — do not ask for my personal number.`,
  );
  return `https://wa.me/${RELAY_E164}?text=${text}`;
}

export function relayTel(): string {
  return 'tel:+914067001234';
}
