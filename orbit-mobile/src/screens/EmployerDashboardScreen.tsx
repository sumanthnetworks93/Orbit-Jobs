import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import {
  AI_INSIGHTS,
  CANDIDATES,
  HIRING_STAGES,
  INTERVIEWS,
  JOBS,
  MISSING_SKILLS,
  QUALITY,
  SKILL_SHARE,
  greeting,
  matchLabel,
  type Candidate,
  type EmployerJob,
  type HiringStage,
  type JobStatus,
} from '../employer/data';
import { dash } from '../employer/theme';
import { LegalSupportBlock } from '../components/LegalSheet';
import { useIsCompact } from '../hyd/useIsCompact';
import {
  getApplications,
  markEmployerReply,
  setApplicationStage,
  type EasyApply,
} from '../hyd/applications';
import { maskPhone, whatsappUrl } from '../hyd/whatsapp';
import { forEmployerView } from '../hyd/customerSecurity';
import { addEmployerListing } from '../services/employerJobs';
import { getAdminProfiles } from '../services/adminModeration';
import { assertSafeListing } from '../hyd/listingGuard';
import {
  getEmployerBilling,
  getPlan,
  MEMBERSHIP_PLANS,
  monthSpend,
  quoteNextJobPost,
  recordJobPost,
  rupees,
  subscribeToPlan,
  type EmployerBilling,
  type JobQuote,
  type PlanId,
} from '../services/employerBilling';
import { signOutUser } from '../services/auth';
import { fonts } from '../theme/typography';

type NavId =
  | 'dashboard'
  | 'jobs'
  | 'candidates'
  | 'shortlist'
  | 'interviews'
  | 'messages'
  | 'analytics'
  | 'billing'
  | 'company'
  | 'settings';

const NAV: { id: NavId; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'candidates', label: 'Candidates' },
  { id: 'shortlist', label: 'Shortlist' },
  { id: 'interviews', label: 'Interviews' },
  { id: 'messages', label: 'Messages' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'billing', label: 'Billing' },
  { id: 'company', label: 'Company Profile' },
  { id: 'settings', label: 'Settings' },
];

export function EmployerDashboardScreen() {
  const { user } = useAuth();
  const compact = useIsCompact();
  const [menuOpen, setMenuOpen] = useState(false);
  const firstName = (user?.name ?? 'Sarah').split(' ')[0];
  const [nav, setNav] = useState<NavId>('dashboard');
  const [jobs, setJobs] = useState(JOBS);
  const [candidates, setCandidates] = useState(CANDIDATES);
  const [jobFilter, setJobFilter] = useState<'All Jobs' | JobStatus>('All Jobs');
  const [jobQuery, setJobQuery] = useState('');
  const [headerQuery, setHeaderQuery] = useState('');
  const [insightsJobId, setInsightsJobId] = useState<string | null>(null);
  const [openCandidateId, setOpenCandidateId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postSalary, setPostSalary] = useState('');
  const [postLocation, setPostLocation] = useState('Hyderabad, Telangana');
  const [moreJobId, setMoreJobId] = useState<string | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [inbox, setInbox] = useState<EasyApply[]>([]);
  const [billing, setBilling] = useState<EmployerBilling | null>(null);
  const [jobQuote, setJobQuote] = useState<JobQuote | null>(null);

  useEffect(() => {
    void getEmployerBilling().then(setBilling).catch(() => undefined);
    void quoteNextJobPost().then(setJobQuote).catch(() => undefined);
  }, [nav, postOpen]);

  useEffect(() => {
    getApplications()
      .then((apps) => {
        const secured = apps.map(forEmployerView);
        setInbox(secured);
        const mapped = secured.map(applicationToCandidate);
        setCandidates((current) => {
          const incoming = new Set(mapped.map((item) => item.id));
          return [...mapped, ...current.filter((item) => !incoming.has(item.id))];
        });
      })
      .catch(() => undefined);
  }, [nav]);

  const insightsJob = jobs.find((job) => job.id === insightsJobId) ?? jobs[0];
  const openCandidate = candidates.find((c) => c.id === openCandidateId) ?? null;
  const jobCandidates = candidates.filter((c) => c.jobId === insightsJob.id);
  const shortlisted = candidates.filter((c) => c.shortlisted);
  const recommended = [...jobCandidates].sort((a, b) => b.match - a.match).slice(0, 3);

  const kpis = useMemo(() => {
    const active = jobs.filter((j) => j.status === 'Active').length;
    const applicants = jobs.reduce((sum, j) => sum + j.applicants, 0);
    const listed = jobs.reduce((sum, j) => sum + j.shortlisted, 0);
    return [
      { label: 'Active Jobs', value: String(active), delta: '+1 this week' },
      { label: 'Total Applicants', value: String(applicants), delta: '+18% this week' },
      { label: 'Candidates Shortlisted', value: String(listed), delta: '+6 this week' },
      { label: 'Interviews Scheduled', value: String(INTERVIEWS.length), delta: '+2 this week' },
    ];
  }, [jobs, candidates]);

  const filteredJobs = jobs.filter((job) => {
    const matchFilter = jobFilter === 'All Jobs' || job.status === jobFilter;
    const q = `${jobQuery} ${headerQuery}`.trim().toLowerCase();
    const matchQuery = !q || `${job.title} ${job.location}`.toLowerCase().includes(q);
    return matchFilter && matchQuery;
  });

  function setStatus(jobId: string, status: JobStatus) {
    setJobs((current) => current.map((job) => (job.id === jobId ? { ...job, status } : job)));
  }

  function shortlist(id: string) {
    setCandidates((current) =>
      current.map((c) => (c.id === id ? { ...c, shortlisted: true, stage: c.stage ?? 'Shortlisted' } : c)),
    );
    if (id.startsWith('app-')) {
      void setApplicationStage(id, 'Shortlisted');
    }
  }

  async function messageCandidate(person: Candidate) {
    const url = whatsappUrl(person.title, user?.company ?? 'Helios Health', person.name);
    await markEmployerReply(9003);
    const opened = await Linking.canOpenURL(url);
    if (opened) await Linking.openURL(url);
  }

  function reject(id: string) {
    setCandidates((current) => current.filter((c) => c.id !== id));
    setOpenCandidateId(null);
  }

  function moveStage(id: string, stage: HiringStage) {
    setCandidates((current) => current.map((c) => (c.id === id ? { ...c, shortlisted: true, stage } : c)));
  }

  function toggleCompare(id: string) {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 4) return current;
      return [...current, id];
    });
  }

  async function publishJob() {
    if (!postTitle.trim()) return;
    const company = user?.company?.trim() || 'Helios Health';
    const check = assertSafeListing({
      title: postTitle.trim(),
      company,
      location: postLocation.trim(),
      salary: postSalary.trim(),
    });
    if (!check.ok) {
      Alert.alert('Post a Job', check.error);
      return;
    }
    const profiles = await getAdminProfiles();
    const verified = profiles.some(
      (profile) =>
        profile.role === 'employer' &&
        profile.status === 'verified' &&
        !profile.suspended &&
        (profile.email === user?.email || profile.company === company),
    );
    const quote = await quoteNextJobPost();
    const created = {
      id: `job-${Date.now()}`,
      title: postTitle.trim(),
      location: postLocation.trim(),
      workType: 'Hybrid' as const,
      employmentType: 'Full-time' as const,
      postedAt: 'Sep 8, 2026',
      postedDaysAgo: 0,
      applicants: 0,
      shortlisted: 0,
      status: verified ? ('Active' as const) : ('Draft' as const),
    };
    setJobs((current) => [created, ...current]);
    await addEmployerListing({
      title: created.title,
      location: created.location,
      jobType: created.employmentType,
      salary: postSalary.trim(),
      tags: 'Finance',
      holdForReview: !verified,
    }).catch(() => undefined);
    const nextBilling = await recordJobPost(quote);
    setBilling(nextBilling);
    setJobQuote(await quoteNextJobPost());
    setPostTitle('');
    setPostSalary('');
    setPostOpen(false);
    setInsightsJobId(null);
    setNav('jobs');
  }

  return (
    <View style={styles.root} testID="employer-screen">
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.shell}>
          {compact && menuOpen ? (
            <Pressable style={styles.menuScrim} onPress={() => setMenuOpen(false)} />
          ) : null}
          <View style={[styles.sidebar, compact && styles.sidebarCompact, compact && !menuOpen && styles.sidebarHidden]} testID="employer-sidebar">
            <View style={styles.brandRow}>
              <View style={styles.logo}><Text style={styles.logoText}>H</Text></View>
              <View>
                <Text style={styles.brand}>Helios</Text>
                <Text style={styles.brandSub}>Employer</Text>
              </View>
            </View>
            {NAV.map((item) => (
              <Pressable
                key={item.id}
                testID={`employer-nav-${item.id}`}
                onPress={() => {
                  setInsightsJobId(null);
                  setNav(item.id);
                  setMenuOpen(false);
                }}
                style={[styles.navItem, nav === item.id && styles.navItemOn]}
              >
                <Text style={[styles.navText, nav === item.id && styles.navTextOn]}>{item.label}</Text>
              </Pressable>
            ))}
            <Pressable testID="employer-sign-out" onPress={() => void signOutUser()} style={styles.signOut}>
              <Text style={styles.signOutText}>Sign out</Text>
            </Pressable>
          </View>

          <View style={styles.main}>
            <View style={[styles.header, compact && styles.headerCompact]}>
              <View style={styles.welcomeRow}>
                {compact ? (
                  <Pressable testID="employer-menu" onPress={() => setMenuOpen((v) => !v)} style={styles.menuBtn}>
                    <Text style={styles.menuBtnText}>Menu</Text>
                  </Pressable>
                ) : null}
                <View style={styles.logoLg}><Text style={styles.logoText}>H</Text></View>
                <View>
                  <Text style={styles.welcome} testID="employer-welcome">
                    {greeting()}, {firstName}
                  </Text>
                  <Text style={styles.company} testID="employer-company">
                    {user?.company ?? 'Helios Health'}
                  </Text>
                </View>
              </View>
              <View style={[styles.headerRight, compact && styles.headerRightCompact]}>
                <TextInput
                  testID="employer-global-search"
                  value={headerQuery}
                  onChangeText={setHeaderQuery}
                  placeholder="Search jobs, candidates"
                  placeholderTextColor={dash.label}
                  style={[styles.search, compact && styles.searchCompact]}
                />
                <Pressable testID="employer-notifications" onPress={() => setNotesOpen((v) => !v)} style={styles.bell}>
                  <Text style={styles.bellText}>3</Text>
                </Pressable>
                <View style={styles.avatar} testID="employer-avatar"><Text style={styles.avatarText}>SB</Text></View>
                <Pressable
                  testID="employer-go-post"
                  onPress={() => setPostOpen(true)}
                  style={styles.primary}
                >
                  <Text style={styles.primaryText}>+ Post a Job</Text>
                </Pressable>
              </View>
            </View>

            <ScrollView contentContainerStyle={styles.body}>
              {notesOpen ? (
                <View style={styles.notes} testID="employer-notes">
                  <Text style={styles.insight}>Priya Nair accepted a phone screen for Thursday.</Text>
                  <Text style={styles.insight}>8 new applicants on Financial Analyst.</Text>
                  <Text style={styles.insight}>Lena Ortiz is interview-ready for FP&A Manager.</Text>
                </View>
              ) : null}

              {nav === 'dashboard' ? (
                <Text style={styles.workflow}>
                  Post Job → Receive Applicants → View AI Insights → Review Candidate → Shortlist → Interview → Hire
                </Text>
              ) : null}

              {(nav === 'dashboard' || nav === 'jobs') && !insightsJobId ? (
                <>
                  {nav === 'dashboard' ? (
                    <View style={styles.kpiRow}>
                      {kpis.map((kpi) => (
                        <View key={kpi.label} style={styles.kpi} testID={`kpi-${kpi.label}`}>
                          <Text style={styles.kpiLabel}>{kpi.label}</Text>
                          <Text style={styles.kpiValue}>{kpi.value}</Text>
                          <Text style={styles.kpiDelta}>{kpi.delta}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  <Text style={styles.h2}>Your Job Listings</Text>
                  <View style={styles.filters}>
                    {(['All Jobs', 'Active', 'Draft', 'Paused', 'Closed'] as const).map((item) => (
                      <Pressable
                        key={item}
                        testID={`job-filter-${item}`}
                        onPress={() => setJobFilter(item)}
                        style={[styles.chip, jobFilter === item && styles.chipOn]}
                      >
                        <Text style={[styles.chipText, jobFilter === item && styles.chipTextOn]}>{item}</Text>
                      </Pressable>
                    ))}
                    <TextInput
                      testID="employer-job-search"
                      value={jobQuery}
                      onChangeText={setJobQuery}
                      placeholder="Search job listings"
                      placeholderTextColor={dash.label}
                      style={styles.inlineSearch}
                    />
                  </View>
                  {filteredJobs.map((job) => (
                    <JobRow
                      key={job.id}
                      job={job}
                      onInsights={() => {
                        setInsightsJobId(job.id);
                        setNav('candidates');
                      }}
                      onApplicants={() => {
                        setInsightsJobId(job.id);
                        setNav('candidates');
                      }}
                      onPause={() => setStatus(job.id, job.status === 'Paused' ? 'Active' : 'Paused')}
                      onClose={() => setStatus(job.id, 'Closed')}
                      moreOpen={moreJobId === job.id}
                      onMore={() => setMoreJobId((id) => (id === job.id ? null : job.id))}
                    />
                  ))}
                </>
              ) : null}

              {(nav === 'candidates' || insightsJobId) && nav !== 'shortlist' ? (
                <InsightsAndCandidates
                  job={insightsJob}
                  applicants={jobCandidates}
                  recommended={recommended}
                  onOpen={setOpenCandidateId}
                  onShortlist={shortlist}
                  onBack={() => setInsightsJobId(null)}
                />
              ) : null}

              {nav === 'shortlist' ? (
                <ShortlistView
                  people={shortlisted}
                  compareIds={compareIds}
                  onToggleCompare={toggleCompare}
                  onCompare={() => setShowCompare(true)}
                  onStage={moveStage}
                  onOpen={setOpenCandidateId}
                />
              ) : null}

              {nav === 'interviews' ? (
                <SimpleList
                  title="Interviews"
                  rows={INTERVIEWS.map((item) => `${item.name} · ${item.role} · ${item.when} · ${item.stage}`)}
                />
              ) : null}
              {nav === 'messages' ? (
                <SimpleList
                  title="WhatsApp (Orbit relay)"
                  rows={
                    inbox.length
                      ? inbox.map((item) => `${item.name} · ${item.jobTitle} · ${maskPhone(item.phone)} · ${item.channel}`)
                      : ['No seeker WhatsApp threads yet. Applies from the Jobs tab land here.']
                  }
                />
              ) : null}
              {nav === 'analytics' ? (
                <SimpleList
                  title="Analytics"
                  rows={['Pipeline conversion this week: 18% more applicants', 'Interview-ready candidates: 4', 'Average match on active roles: 76%']}
                />
              ) : null}
              {nav === 'billing' ? (
                <BillingView
                  billing={billing}
                  onSubscribe={(planId) =>
                    void subscribeToPlan(planId).then(async (next) => {
                      setBilling(next);
                      setJobQuote(await quoteNextJobPost());
                    })
                  }
                />
              ) : null}
              {nav === 'company' ? (
                <SimpleList
                  title="Company Profile"
                  rows={[
                    `${user?.company ?? 'Helios Health'}`,
                    'Healthcare · HITEC City, Hyderabad',
                    'Verified employer after Super Admin review',
                    'Ghost jobs auto-freeze if you do not reply in 7 days',
                    'Candidate phones stay masked. GST invoices issued by Orbit entity.',
                  ]}
                />
              ) : null}
              {nav === 'settings' ? (
                <View>
                  <SimpleList
                    title="Settings"
                    rows={[
                      'Notifications on',
                      'AI insights are decision-support only',
                      'No automatic rejection from match scores',
                      'Candidate phones stay masked on WhatsApp relay',
                      'Post → Applicants → AI Insights → Shortlist → Interview → Hire',
                    ]}
                  />
                  <LegalSupportBlock />
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>

      {openCandidate ? (
        <CandidateDrawer
          candidate={openCandidate}
          jobTitle={jobs.find((j) => j.id === openCandidate.jobId)?.title ?? ''}
          onClose={() => setOpenCandidateId(null)}
          onShortlist={() => shortlist(openCandidate.id)}
          onInterview={() => moveStage(openCandidate.id, 'Interview')}
          onMessage={() => void messageCandidate(openCandidate)}
          onReject={() => reject(openCandidate.id)}
        />
      ) : null}

      {showCompare ? (
        <CompareSheet
          people={candidates.filter((c) => compareIds.includes(c.id))}
          onClose={() => setShowCompare(false)}
        />
      ) : null}

      {postOpen ? (
        <View style={styles.overlay} testID="employer-post-screen">
          <View style={styles.modal}>
            <Text style={styles.h2}>Post a Job</Text>
            <Text style={styles.billingHint} testID="employer-post-quota">
              {jobQuote
                ? jobQuote.chargeInr === 0
                  ? `${jobQuote.remainingIncluded} of ${jobQuote.included} included jobs left this month on ${getPlan(jobQuote.planId).name}.`
                  : `Free quota used. This job is ${rupees(jobQuote.chargeInr)}.`
                : 'Two jobs each month are free. Extra jobs are ₹25.'}
            </Text>
            <TextInput
              testID="employer-post-title"
              value={postTitle}
              onChangeText={setPostTitle}
              placeholder="Role title"
              placeholderTextColor={dash.label}
              style={styles.modalInput}
            />
            <TextInput
              testID="employer-post-location"
              value={postLocation}
              onChangeText={setPostLocation}
              placeholder="Location"
              placeholderTextColor={dash.label}
              style={styles.modalInput}
            />
            <TextInput
              testID="employer-post-salary"
              value={postSalary}
              onChangeText={setPostSalary}
              placeholder="Salary or stipend range"
              placeholderTextColor={dash.label}
              style={styles.modalInput}
            />
            <Text style={styles.meta}>
              Unverified recruiters stay in review. Do not charge candidates. Posting does not replace statutory vacancy duties. GST invoices come from the registered Orbit entity.
            </Text>
            <View style={styles.modalRow}>
              <Pressable onPress={() => setPostOpen(false)} style={styles.ghost}><Text style={styles.ghostText}>Cancel</Text></Pressable>
              <Pressable testID="employer-publish" onPress={() => void publishJob()} style={styles.primary}>
                <Text style={styles.primaryText}>
                  {jobQuote?.chargeInr ? `Pay ${rupees(jobQuote.chargeInr)} and publish` : 'Publish role'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function applicationToCandidate(app: EasyApply): Candidate {
  return {
    id: app.id,
    name: app.name,
    title: app.jobTitle,
    match: 78,
    experience: 2,
    skills: [app.lastJob, app.area],
    location: `${app.area}, Hyderabad`,
    applied: 'Just now',
    jobId: 'job-analyst',
    shortlisted: app.stage !== 'Applied',
    stage: app.stage === 'Applied' ? null : (app.stage as HiringStage),
    education: 'Generated from 6-field apply',
    industry: 'Hyderabad',
    availability: app.joinWhen,
    summary: app.resumeText,
    why: [`Applied via ${app.channel}`, `Last job: ${app.lastJob}`, `Area: ${app.area}`],
    matchedSkills: [app.lastJob],
    missingSkills: [],
    experienceNotes: app.voiceNote ?? app.lastJob,
    projects: 'Orbit generated resume — no PDF uploaded.',
  };
}

function JobRow({
  job,
  onInsights,
  onApplicants,
  onPause,
  onClose,
  moreOpen,
  onMore,
}: {
  job: EmployerJob;
  onInsights: () => void;
  onApplicants: () => void;
  onPause: () => void;
  onClose: () => void;
  moreOpen: boolean;
  onMore: () => void;
}) {
  return (
    <View style={styles.card} testID={`employer-job-${job.id}`}>
      <View style={styles.jobTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.meta}>
            {job.location} · {job.workType} · {job.employmentType}
          </Text>
          <Text style={styles.meta}>Posted {job.postedAt}</Text>
        </View>
        <Text style={[styles.status, job.status !== 'Active' && { color: dash.muted }]}>{job.status}</Text>
      </View>
      <Text style={styles.counts}>
        {job.applicants} Applicants · {job.shortlisted} Shortlisted
      </Text>
      <View style={styles.actions}>
        <Action label="View Applicants" onPress={onApplicants} />
        <Action label="View Insights" testID={`insights-${job.id}`} onPress={onInsights} />
        <Action label="Edit Job" onPress={onInsights} />
        <Action label={job.status === 'Paused' ? 'Resume Job' : 'Pause Job'} onPress={onPause} />
        <Action label="Close Job" onPress={onClose} />
        <Action label="More" testID={`more-${job.id}`} onPress={onMore} />
      </View>
      {moreOpen ? (
        <Text style={styles.meta}>Duplicate listing · Share hiring link · Export applicants</Text>
      ) : null}
    </View>
  );
}

function InsightsAndCandidates({
  job,
  applicants,
  recommended,
  onOpen,
  onShortlist,
  onBack,
}: {
  job: EmployerJob;
  applicants: Candidate[];
  recommended: Candidate[];
  onOpen: (id: string) => void;
  onShortlist: (id: string) => void;
  onBack: () => void;
}) {
  const total = QUALITY.reduce((sum, item) => sum + item.count, 0);
  return (
    <View testID="employer-insights">
      <Pressable onPress={onBack}><Text style={styles.back}>← All jobs</Text></Pressable>
      <Text style={styles.h2}>{job.title}</Text>
      <Text style={styles.meta}>
        {job.location} · {job.workType} · Posted {job.postedDaysAgo || 0} days ago
      </Text>
      <View style={styles.kpiRow}>
        {[
          ['Applicants', String(job.applicants)],
          ['Strong Matches', '12'],
          ['Shortlisted', String(job.shortlisted)],
          ['Interview Ready', '4'],
        ].map(([label, value]) => (
          <View key={label} style={styles.kpi}>
            <Text style={styles.kpiLabel}>{label}</Text>
            <Text style={styles.kpiValue}>{value}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.h3}>Applicant Quality</Text>
      {QUALITY.map((row) => (
        <View key={row.label} style={styles.barRow}>
          <Text style={styles.barLabel}>{row.label} — {row.count} candidates</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${(row.count / total) * 100}%` }]} />
          </View>
        </View>
      ))}

      <Text style={styles.h3}>AI Candidate Insights</Text>
      <Text style={styles.disclaimer}>
        AI recommendations are decision-support only. Do not reject candidates based only on a match score.
      </Text>
      {AI_INSIGHTS.map((line) => (
        <Text key={line} style={styles.insight}>• {line}</Text>
      ))}

      <Text style={styles.h3}>Top Skills Among Applicants</Text>
      <View style={styles.skillWrap}>
        {SKILL_SHARE.map((skill) => (
          <View key={skill.name} style={styles.skillChip}>
            <Text style={styles.skillText}>{skill.name} — {skill.pct}%</Text>
          </View>
        ))}
      </View>
      <Text style={styles.h3}>Skills Missing Most Often</Text>
      <View style={styles.skillWrap}>
        {MISSING_SKILLS.map((skill) => (
          <View key={skill} style={styles.skillChip}><Text style={styles.skillText}>{skill}</Text></View>
        ))}
      </View>

      <Text style={styles.h3}>Recommended for Shortlist</Text>
      {recommended.map((person) => (
        <View key={person.id} style={styles.card}>
          <Text style={styles.jobTitle}>{person.name}</Text>
          <Text style={styles.meta}>{person.title} · {person.match}% · {person.experience} years</Text>
          <Text style={styles.meta}>Top matching skills: {person.skills.join(' · ')}</Text>
          <Text style={styles.insight}>
            Reason recommended: {person.id === 'c-alex'
              ? 'Strong financial modeling, forecasting, Excel, and healthcare finance experience.'
              : 'Strong overlap with required finance skills and recent relevant experience.'}
          </Text>
          <View style={styles.actions}>
            <Action label="View Profile" onPress={() => onOpen(person.id)} />
            <Action label="Add to Shortlist" onPress={() => onShortlist(person.id)} />
          </View>
        </View>
      ))}

      <Text style={styles.h3}>Candidate List</Text>
      <View style={styles.tableHead}>
        {['Candidate', 'AI Match', 'Experience', 'Top Skills', 'Location', 'Applied', 'Status', 'Actions'].map((col) => (
          <Text key={col} style={styles.th}>{col}</Text>
        ))}
      </View>
      {applicants.map((person) => (
        <View key={person.id} style={styles.tableRow} testID={`candidate-${person.id}`}>
          <Pressable onPress={() => onOpen(person.id)} style={{ flex: 1.3 }}>
            <Text style={styles.jobTitle}>{person.name}</Text>
            <Text style={styles.meta}>{person.title}</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.jobTitle}>{person.match}%</Text>
            <MatchBadge score={person.match} />
          </View>
          <Text style={[styles.meta, { flex: 0.9 }]}>{person.experience} Years Experience</Text>
          <Text style={[styles.meta, { flex: 1.2 }]}>{person.skills.join(' · ')}</Text>
          <Text style={[styles.meta, { flex: 0.9 }]}>{person.location}</Text>
          <Text style={[styles.meta, { flex: 0.8 }]}>{person.applied}</Text>
          <View style={{ flex: 1 }}><MatchBadge score={person.match} /></View>
          <View style={{ flex: 1.1, gap: 6 }}>
            <Action label="View Profile" onPress={() => onOpen(person.id)} />
            <Action label="Shortlist" onPress={() => onShortlist(person.id)} />
          </View>
        </View>
      ))}
    </View>
  );
}

function ShortlistView({
  people,
  compareIds,
  onToggleCompare,
  onCompare,
  onStage,
  onOpen,
}: {
  people: Candidate[];
  compareIds: string[];
  onToggleCompare: (id: string) => void;
  onCompare: () => void;
  onStage: (id: string, stage: HiringStage) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <View testID="employer-shortlist">
      <View style={styles.jobTop}>
        <Text style={styles.h2}>Shortlisted Candidates</Text>
        <Pressable
          testID="compare-candidates"
          disabled={compareIds.length < 2}
          onPress={onCompare}
          style={[styles.primary, compareIds.length < 2 && { opacity: 0.4 }]}
        >
          <Text style={styles.primaryText}>Compare Candidates</Text>
        </Pressable>
      </View>
      {people.map((person) => (
        <View key={person.id} style={styles.card}>
          <Pressable onPress={() => onOpen(person.id)}>
            <Text style={styles.jobTitle}>{person.name}</Text>
            <Text style={styles.meta}>
              {person.match}% · {JOBS.find((j) => j.id === person.jobId)?.title} · {person.experience} years
            </Text>
            <Text style={styles.meta}>{person.skills.join(' · ')}</Text>
          </Pressable>
          <View style={styles.stageRow}>
            {HIRING_STAGES.map((stage) => (
              <Pressable
                key={stage}
                onPress={() => onStage(person.id, stage)}
                style={[styles.stage, person.stage === stage && styles.stageOn]}
              >
                <Text style={[styles.stageText, person.stage === stage && styles.stageTextOn]}>{stage}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={() => onToggleCompare(person.id)} style={styles.ghost}>
            <Text style={styles.ghostText}>{compareIds.includes(person.id) ? 'Selected for compare' : 'Select to compare'}</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

function CandidateDrawer({
  candidate,
  jobTitle,
  onClose,
  onShortlist,
  onInterview,
  onMessage,
  onReject,
}: {
  candidate: Candidate;
  jobTitle: string;
  onClose: () => void;
  onShortlist: () => void;
  onInterview: () => void;
  onMessage: () => void;
  onReject: () => void;
}) {
  const compact = useIsCompact();
  return (
    <View style={styles.drawerWrap} testID="candidate-drawer">
      <Pressable testID="candidate-drawer-close" style={styles.drawerScrim} onPress={onClose} />
      <ScrollView style={[styles.drawer, compact && styles.drawerCompact]}>
        <Pressable onPress={onClose} style={styles.back}><Text style={styles.back}>Close profile</Text></Pressable>
        <Text style={styles.h2}>{candidate.name}</Text>
        <Text style={styles.meta}>{candidate.title} · {jobTitle}</Text>
        <Text style={styles.meta}>{candidate.location} · {candidate.experience} years</Text>
        <Text style={styles.meta}>Resume: {candidate.resumeUrl ?? 'Resume.pdf'}</Text>
        {candidate.linkedin ? <Text style={styles.meta}>LinkedIn: {candidate.linkedin}</Text> : null}
        {candidate.portfolio ? <Text style={styles.meta}>Portfolio: {candidate.portfolio}</Text> : null}
        <Text style={styles.kpiValue}>{candidate.match}% AI Match</Text>
        <Text style={styles.disclaimer}>Skill and requirement alignment only. Not an automated hire/reject decision.</Text>
        <Text style={styles.h3}>Why this candidate matches</Text>
        {candidate.why.map((line) => <Text key={line} style={styles.insight}>• {line}</Text>)}
        <Text style={styles.h3}>Matched Skills</Text>
        <Text style={styles.meta}>{candidate.matchedSkills.join(' · ')}</Text>
        <Text style={styles.h3}>Missing / Preferred Skills</Text>
        <Text style={styles.meta}>{candidate.missingSkills.join(' · ') || 'None flagged'}</Text>
        <Text style={styles.h3}>Resume Summary</Text>
        <Text style={styles.insight}>{candidate.summary}</Text>
        <Text style={styles.h3}>Work Experience</Text>
        <Text style={styles.insight}>{candidate.experienceNotes}</Text>
        <Text style={styles.h3}>Education</Text>
        <Text style={styles.insight}>{candidate.education}</Text>
        <Text style={styles.h3}>Skills</Text>
        <Text style={styles.insight}>{[...candidate.matchedSkills, ...candidate.skills].filter((item, i, arr) => arr.indexOf(item) === i).join(' · ')}</Text>
        <Text style={styles.h3}>Projects</Text>
        <Text style={styles.insight}>{candidate.projects}</Text>
        <View style={styles.drawerActions}>
          <Pressable onPress={onShortlist} style={styles.primary}><Text style={styles.primaryText}>Shortlist Candidate</Text></Pressable>
          <Pressable onPress={onInterview} style={styles.ghost}><Text style={styles.ghostText}>Move to Interview</Text></Pressable>
          <Pressable testID="message-candidate" onPress={onMessage} style={styles.ghost}><Text style={styles.ghostText}>Message Candidate</Text></Pressable>
          <Pressable onPress={onReject} style={styles.ghost}><Text style={styles.ghostText}>Reject Application</Text></Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function CompareSheet({ people, onClose }: { people: Candidate[]; onClose: () => void }) {
  const rows = [
    ['AI Match', ...people.map((p) => `${p.match}%`)],
    ['Years Experience', ...people.map((p) => `${p.experience}`)],
    ['Required Skills', ...people.map((p) => p.matchedSkills.join(', '))],
    ['Preferred gaps', ...people.map((p) => p.missingSkills.join(', ') || '—')],
    ['Education', ...people.map((p) => p.education)],
    ['Industry', ...people.map((p) => p.industry)],
    ['Location', ...people.map((p) => p.location)],
    ['Availability', ...people.map((p) => p.availability)],
  ];
  return (
    <View style={styles.overlay} testID="compare-sheet">
      <View style={[styles.modal, { width: '90%', maxWidth: 980 }]}>
        <Text style={styles.h2}>Compare Candidates</Text>
        <Text style={styles.disclaimer}>Highlights strengths and gaps. The employer still makes the hiring decision.</Text>
        <View style={styles.compareHead}>
          <Text style={[styles.compareCell, styles.compareLabel]} />
          {people.map((p) => <Text key={p.id} style={styles.compareCell}>{p.name}</Text>)}
        </View>
        {rows.map((row) => (
          <View key={row[0]} style={styles.compareHead}>
            {row.map((cell, index) => (
              <Text key={`${row[0]}-${index}`} style={[styles.compareCell, index === 0 && styles.compareLabel]}>{cell}</Text>
            ))}
          </View>
        ))}
        <Pressable testID="compare-close" onPress={onClose} style={[styles.primary, { marginTop: 16 }]}><Text style={styles.primaryText}>Close</Text></Pressable>
      </View>
    </View>
  );
}

function BillingView({
  billing,
  onSubscribe,
}: {
  billing: EmployerBilling | null;
  onSubscribe: (planId: PlanId) => void;
}) {
  const plan = getPlan(billing?.planId ?? 'free');
  const used = billing?.postsThisMonth ?? 0;
  const spend = billing ? monthSpend(billing) : 0;
  return (
    <View testID="employer-billing">
      <Text style={styles.h2}>Billing</Text>
      <Text style={styles.billingHint}>
        {plan.name} · {used} of {plan.jobsPerMonth} included jobs used this month · {rupees(spend)} spent
      </Text>
      <Text style={styles.meta}>Two jobs each month are free. Every extra job is ₹25. Memberships add more included posts. Platform fees will be invoiced by the registered Orbit entity; have a CA confirm GST. Posting on Orbit does not replace statutory employer vacancy-notification duties.</Text>
      {MEMBERSHIP_PLANS.map((item) => {
        const active = item.id === plan.id;
        return (
          <View key={item.id} style={styles.planCard} testID={`employer-plan-${item.id}`}>
            <Text style={styles.jobTitle}>
              {item.name}
              {active ? ' · Current' : ''}
            </Text>
            <Text style={styles.counts}>
              {item.priceInr === 0 ? '₹0 / month' : `${rupees(item.priceInr)} / month`} · {item.jobsPerMonth} jobs included · extras {rupees(item.extraJobInr)}
            </Text>
            <Text style={styles.meta}>{item.blurb}</Text>
            {active ? null : (
              <Pressable
                testID={`employer-subscribe-${item.id}`}
                onPress={() => onSubscribe(item.id)}
                style={styles.ghost}
              >
                <Text style={styles.ghostText}>
                  {item.priceInr === 0 ? 'Switch to Free' : `Subscribe · ${rupees(item.priceInr)}`}
                </Text>
              </Pressable>
            )}
          </View>
        );
      })}
    </View>
  );
}

function SimpleList({ title, rows }: { title: string; rows: string[] }) {
  return (
    <View>
      <Text style={styles.h2}>{title}</Text>
      {rows.map((row) => (
        <View key={row} style={styles.card}><Text style={styles.meta}>{row}</Text></View>
      ))}
    </View>
  );
}

function MatchBadge({ score }: { score: number }) {
  const label = matchLabel(score);
  const tone = score >= 90 ? dash.excellent : score >= 75 ? dash.strong : score >= 60 ? dash.potential : dash.review;
  return (
    <View style={[styles.badge, { borderColor: tone }]}>
      <Text style={[styles.badgeText, { color: tone }]}>{label}</Text>
    </View>
  );
}

function Action({ label, onPress, testID }: { label: string; onPress: () => void; testID?: string }) {
  return (
    <Pressable testID={testID} onPress={onPress} style={styles.action}>
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: dash.canvas },
  safe: { flex: 1 },
  shell: { flex: 1, flexDirection: 'row' },
  sidebar: {
    width: 220,
    backgroundColor: dash.white,
    borderRightWidth: 1,
    borderRightColor: dash.line,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
    alignSelf: 'stretch',
    minHeight: '100%',
  },
  sidebarCompact: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  sidebarHidden: { display: 'none' },
  menuScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20,20,20,0.28)',
    zIndex: 15,
  },
  menuBtn: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: dash.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: dash.white,
  },
  menuBtnText: { fontFamily: fonts.medium, fontSize: 13, color: dash.ink },
  headerCompact: { flexWrap: 'wrap' },
  headerRightCompact: { width: '100%', flexWrap: 'wrap' },
  searchCompact: { width: '100%', flexGrow: 1 },
  drawerCompact: { width: '100%' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  brand: { fontFamily: fonts.semiBold, fontSize: 20, color: dash.ink },
  brandSub: { fontFamily: fonts.regular, fontSize: 12, color: dash.label },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: dash.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: dash.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: dash.white, fontFamily: fonts.semiBold, fontSize: 16 },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  workflow: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: dash.muted,
    marginBottom: 16,
    padding: 12,
    backgroundColor: dash.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: dash.line,
  },
  notes: {
    backgroundColor: dash.white,
    borderWidth: 1,
    borderColor: dash.line,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  tableHead: { flexDirection: 'row', paddingHorizontal: 14, marginBottom: 6, gap: 8 },
  th: { flex: 1, fontFamily: fonts.medium, fontSize: 11, color: dash.label },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },
  badgeText: { fontFamily: fonts.medium, fontSize: 11 },
  navItem: { paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10, marginBottom: 4 },
  navItemOn: { backgroundColor: dash.soft },
  navText: { fontFamily: fonts.medium, fontSize: 14, color: dash.muted },
  navTextOn: { color: dash.ink },
  signOut: { marginTop: 24, paddingVertical: 10 },
  signOutText: { fontFamily: fonts.medium, fontSize: 13, color: dash.muted },
  main: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: dash.white,
    borderBottomWidth: 1,
    borderBottomColor: dash.line,
    gap: 16,
  },
  welcome: { fontFamily: fonts.semiBold, fontSize: 22, color: dash.ink },
  company: { fontFamily: fonts.regular, fontSize: 13, color: dash.muted, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  search: {
    width: 220,
    height: 40,
    borderWidth: 1,
    borderColor: dash.line,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: dash.white,
    color: dash.ink,
    fontFamily: fonts.regular,
  },
  bell: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: dash.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellText: { fontFamily: fonts.medium, fontSize: 12, color: dash.ink },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: dash.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: dash.white, fontFamily: fonts.medium, fontSize: 12 },
  primary: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: dash.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: dash.white, fontFamily: fonts.medium, fontSize: 13 },
  body: { padding: 24, paddingBottom: 80 },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 22 },
  kpi: {
    flexGrow: 1,
    minWidth: 160,
    backgroundColor: dash.white,
    borderWidth: 1,
    borderColor: dash.line,
    borderRadius: 16,
    padding: 16,
  },
  kpiLabel: { fontFamily: fonts.medium, fontSize: 12, color: dash.label },
  kpiValue: { fontFamily: fonts.semiBold, fontSize: 28, color: dash.ink, marginTop: 6 },
  kpiDelta: { fontFamily: fonts.regular, fontSize: 12, color: dash.excellent, marginTop: 6 },
  h2: { fontFamily: fonts.semiBold, fontSize: 22, color: dash.ink, marginBottom: 12 },
  h3: { fontFamily: fonts.semiBold, fontSize: 16, color: dash.ink, marginTop: 22, marginBottom: 10 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14, alignItems: 'center' },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: dash.line,
    backgroundColor: dash.white,
  },
  chipOn: { backgroundColor: dash.ink, borderColor: dash.ink },
  chipText: { fontFamily: fonts.medium, fontSize: 12, color: dash.muted },
  chipTextOn: { color: dash.white },
  inlineSearch: {
    minWidth: 200,
    height: 36,
    borderWidth: 1,
    borderColor: dash.line,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: dash.white,
    color: dash.ink,
  },
  card: {
    backgroundColor: dash.white,
    borderWidth: 1,
    borderColor: dash.line,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  jobTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 8 },
  jobTitle: { fontFamily: fonts.semiBold, fontSize: 16, color: dash.ink },
  meta: { fontFamily: fonts.regular, fontSize: 13, color: dash.muted, marginTop: 3 },
  status: { fontFamily: fonts.medium, fontSize: 12, color: dash.excellent },
  counts: { fontFamily: fonts.medium, fontSize: 13, color: dash.ink, marginTop: 8 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  action: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: dash.soft,
  },
  actionText: { fontFamily: fonts.medium, fontSize: 12, color: dash.ink },
  barRow: { marginBottom: 10 },
  barLabel: { fontFamily: fonts.regular, fontSize: 13, color: dash.muted, marginBottom: 4 },
  barTrack: { height: 8, borderRadius: 99, backgroundColor: dash.soft, overflow: 'hidden' },
  barFill: { height: 8, backgroundColor: dash.ink, borderRadius: 99 },
  disclaimer: { fontFamily: fonts.regular, fontSize: 12, color: dash.potential, marginBottom: 10 },
  billingHint: { fontFamily: fonts.regular, fontSize: 14, color: dash.muted, lineHeight: 20, marginBottom: 12 },
  planCard: {
    borderWidth: 1,
    borderColor: dash.line,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    backgroundColor: dash.white,
  },
  insight: { fontFamily: fonts.regular, fontSize: 14, color: dash.ink, lineHeight: 21, marginBottom: 6 },
  skillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: {
    borderWidth: 1,
    borderColor: dash.line,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: dash.white,
  },
  skillText: { fontFamily: fonts.medium, fontSize: 12, color: dash.ink },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: dash.white,
    borderWidth: 1,
    borderColor: dash.line,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  back: { fontFamily: fonts.medium, fontSize: 13, color: dash.muted, marginBottom: 8 },
  stageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  stage: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: dash.soft,
  },
  stageOn: { backgroundColor: dash.ink },
  stageText: { fontFamily: fonts.medium, fontSize: 10, color: dash.muted },
  stageTextOn: { color: dash.white },
  ghost: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: dash.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: dash.white,
    marginTop: 8,
  },
  ghostText: { fontFamily: fonts.medium, fontSize: 13, color: dash.ink },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20,20,20,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: dash.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: dash.line,
  },
  modalInput: {
    height: 48,
    borderWidth: 1,
    borderColor: dash.line,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginTop: 8,
    color: dash.ink,
  },
  modalRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  drawerWrap: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', justifyContent: 'flex-end' },
  drawerScrim: { flex: 1, backgroundColor: 'rgba(20,20,20,0.2)' },
  drawer: {
    width: 420,
    maxWidth: '100%',
    backgroundColor: dash.white,
    padding: 22,
    borderLeftWidth: 1,
    borderLeftColor: dash.line,
  },
  drawerActions: { gap: 8, marginTop: 16, marginBottom: 40 },
  compareHead: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: dash.line, paddingVertical: 8 },
  compareCell: { flex: 1, fontFamily: fonts.regular, fontSize: 12, color: dash.ink, paddingRight: 8 },
  compareLabel: { fontFamily: fonts.medium, color: dash.muted },
});
