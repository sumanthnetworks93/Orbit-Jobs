export const SUPPORT_EMAIL = 'support@orbit.app';

export function supportMailto(subject = 'Orbit support') {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export type LegalDocId = 'privacy' | 'terms' | 'notice';

export type LegalDoc = {
  id: LegalDocId;
  title: string;
  updated: string;
  sections: { heading: string; body: string }[];
};

export const LEGAL_DOCS: Record<LegalDocId, LegalDoc> = {
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    updated: '11 September 2026',
    sections: [
      {
        heading: 'Who we are',
        body: 'Orbit is a Hyderabad hiring product. This policy explains how we collect, use, and share personal data when you use the app as a seeker, employer, or Super Admin.',
      },
      {
        heading: 'What we collect',
        body: 'Account name and email, guest session flags, voice-resume text (name, area, last job, joining date), phone numbers used only through the Orbit WhatsApp relay, job applications, saved startups, AI match preferences, and employer billing records. We do not ask seekers to upload a PDF resume.',
      },
      {
        heading: 'Where it is stored',
        body: 'When you have an account, we save customer records in our application database: your user id, name, masked phone, area, last job, joining date, voice note, generated 6-field resume, the job you applied to, and hiring stage. Account name and email are held by our sign-in provider. Guest applies stay on this device until you sign in, then they are written to the same database. Job and startup listings live in the Orbit jobs database. Language, match alerts, and employer billing mocks can also stay on this device.',
      },
      {
        heading: 'How we protect it',
        body: 'Apply fields are length-capped and stripped of markup before save. We do not store a raw personal mobile in the database: only a masked number such as 987****210. Each application row is readable and writable only by the signed-in owner. Employers and Super Admin see the masked number and the WhatsApp relay, not your personal digits. The generated resume also uses the masked number. HTTPS is used for cloud writes. We do not sell seeker data.',
      },
      {
        heading: 'How we use it',
        body: 'To show jobs, generate a 6-field resume, match roles to your area and work history, send in-app match alerts you subscribe to, let employers review applicants, and run Super Admin trust and safety controls. Guest apply can be paused by Super Admin.',
      },
      {
        heading: 'WhatsApp and calls',
        body: 'Employer numbers are masked. Messages go through an Orbit relay so recruiters do not receive your personal number by default. You can turn off WhatsApp match alerts in Profile.',
      },
      {
        heading: 'Payments',
        body: 'Employers get two job posts free each calendar month. Extra posts are ₹25. Memberships are billed in-app as a mock until a payment provider is connected. We do not store card numbers in this version.',
      },
      {
        heading: 'Retention and your rights',
        body: 'Signed-in customer records stay in our database until you ask us to delete them. You can sign out, clear a guest session, or email us to ask for access, correction, or deletion under applicable Indian law including the Digital Personal Data Protection Act, 2023. Contact support@orbit.app.',
      },
    ],
  },
  terms: {
    id: 'terms',
    title: 'Terms of Use',
    updated: '11 September 2026',
    sections: [
      {
        heading: 'The service',
        body: 'Orbit lists Hyderabad jobs and walk-ins, lets seekers apply without a PDF, and gives employers a hiring desk with AI match scores. AI insights are decision-support only. Employers must not reject a person based only on a score.',
      },
      {
        heading: 'Accounts',
        body: 'Seekers may continue as a guest. Employers and Super Admin use staff logins. You are responsible for the accuracy of job posts, applications, and voice notes you submit. Ghost jobs may freeze after seven days with no recruiter reply.',
      },
      {
        heading: 'Employer posts',
        body: 'Two live jobs each month are included on Free. Every extra job is ₹25 unless a membership bundle covers it. Super Admin may require review, freeze, or hide a listing.',
      },
      {
        heading: 'Acceptable use',
        body: 'Do not post fake roles, scrape candidate phones, bypass the WhatsApp relay, or use Orbit to harass applicants. We may suspend accounts that break these terms.',
      },
      {
        heading: 'Liability',
        body: 'Orbit does not guarantee a hire. Walk-in dates and salaries are provided by employers. The service is provided as available. Hyderabad, India is the governing venue for disputes.',
      },
    ],
  },
  notice: {
    id: 'notice',
    title: 'Privacy Notice',
    updated: '11 September 2026',
    sections: [
      {
        heading: 'Short notice',
        body: 'Orbit processes your name, area, last job, joining date, and a relay phone so we can match Hyderabad jobs and let you apply. When you apply while signed in, those fields are saved in our customer database with your personal mobile masked. Legal basis: your consent when you continue, apply, or subscribe to alerts, and our legitimate need to run the hiring desk.',
      },
      {
        heading: 'Sharing',
        body: 'Employers see your 6-field apply, not your raw personal number. Super Admin can verify, suspend, or freeze listings. We do not sell seeker data. Database records are readable by you and by Orbit staff who run hiring and trust controls.',
      },
      {
        heading: 'Alerts',
        body: 'AI job-match notifications are off until you subscribe. You can unsubscribe from the job, the matches sheet, or Profile → Notifications.',
      },
      {
        heading: 'Contact',
        body: 'Data queries: support@orbit.app. If we appoint a Data Protection Officer, that address will be updated here.',
      },
    ],
  },
};

export function getLegalDoc(id: LegalDocId): LegalDoc {
  return LEGAL_DOCS[id];
}
