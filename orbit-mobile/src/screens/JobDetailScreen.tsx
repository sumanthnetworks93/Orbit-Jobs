import { useCallback, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ApplySheet } from '../components/ApplySheet';
import { SocialFooter } from '../components/SocialFooter';
import { useLanguage } from '../hyd/LanguageContext';
import { isJobFrozenForDisplay } from '../hyd/filter';
import { scoreJobMatch } from '../hyd/match';
import { getMatchPrefs, subscribeToJobMatches, unsubscribeFromJobMatches, type MatchPrefs } from '../services/jobAlerts';
import { reportListing, reportMailto } from '../services/reports';
import type { JobDetailParams } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = NativeStackScreenProps<{ JobDetail: JobDetailParams }, 'JobDetail'>;

export function JobDetailScreen({ navigation, route }: Props) {
  const { job } = route.params;
  const { copy } = useLanguage();
  const [applyOpen, setApplyOpen] = useState(false);
  const [reported, setReported] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<MatchPrefs | null>(null);
  const frozen = isJobFrozenForDisplay(job);
  const match = scoreJobMatch(job, prefs ?? { role: '', area: '' });
  const subscribed = Boolean(prefs?.subscribed);

  useFocusEffect(
    useCallback(() => {
      getMatchPrefs().then(setPrefs).catch(() => undefined);
    }, [job.id]),
  );

  return (
    <View style={styles.root} testID="job-detail">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Pressable testID="job-detail-back" onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <ScrollView style={styles.listView} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View style={[styles.avatar, { backgroundColor: job.color }]}>
            <Text style={styles.initial}>{job.initial}</Text>
          </View>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.company}>
            {job.company} · {job.location}
          </Text>
          <Text style={styles.salary}>{job.salary}</Text>
          <Text style={styles.tags}>
            {job.jobType} · {job.tags}
            {job.commuteMin ? ` · ${job.commuteMin} min commute` : ''}
          </Text>

          <View style={styles.badges}>
            {job.verifiedEmployer ? <Badge label={copy.verified} /> : null}
            {frozen ? <Badge label={copy.frozen} /> : null}
            {job.womenSafe ? <Badge label={copy.womenSafe} /> : null}
            {job.cabProvided ? <Badge label={copy.cab} /> : null}
            {job.nearMetro ? <Badge label={copy.metro} /> : null}
            {job.lateShift ? <Badge label={copy.lateShift} /> : null}
            {job.walkIn ? <Badge label={copy.walkInToday} /> : null}
            {match.score >= 45 ? <Badge label={`${match.score}% ${copy.aiMatch}`} /> : null}
          </View>

          {match.score >= 45 ? (
            <Text style={styles.reply}>
              {copy.whyMatch}: {match.reasons.join(' · ')}
            </Text>
          ) : null}

          {job.lastReplyAt ? (
            <Text style={styles.reply}>
              {copy.lastReply}: {new Date(job.lastReplyAt).toLocaleDateString()}
            </Text>
          ) : null}

          {job.walkIn ? (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>{copy.walkins}</Text>
              <Text style={styles.cardBody}>
                {job.walkIn.date} · {job.walkIn.time}
              </Text>
              <Text style={styles.cardBody}>{job.walkIn.venue}</Text>
              <Text style={styles.muted}>
                Ask for {job.walkIn.askFor} · Bring {job.walkIn.bring}
              </Text>
            </View>
          ) : null}

          <Pressable
            testID="job-detail-apply"
            style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
            onPress={() => setApplyOpen(true)}
          >
            <Text style={styles.primaryText}>{copy.apply}</Text>
          </Pressable>
          <Pressable
            testID="job-subscribe-matches"
            style={({ pressed }) => [styles.ghost, pressed && styles.pressed]}
            onPress={() => {
              if (subscribed) {
                void unsubscribeFromJobMatches().then(setPrefs);
                return;
              }
              void subscribeToJobMatches({
                role: job.title,
                area: job.area ?? job.location.split(',')[0] ?? '',
              }).then(setPrefs);
            }}
          >
            <Text style={styles.ghostText}>{subscribed ? copy.subscribed : copy.subscribeMatches}</Text>
          </Pressable>
          <Pressable
            testID="report-job"
            style={({ pressed }) => [styles.ghost, pressed && styles.pressed]}
            onPress={() => {
              void reportListing('job', job).then(() => setReported('job'));
              void Linking.openURL(reportMailto('job', job)).catch(() => undefined);
            }}
          >
            <Text style={styles.ghostText}>{reported === 'job' ? 'Job reported' : 'Report job'}</Text>
          </Pressable>
          <Pressable
            testID="report-employer"
            style={({ pressed }) => [styles.ghost, pressed && styles.pressed]}
            onPress={() => {
              void reportListing('employer', job).then(() => setReported('employer'));
              void Linking.openURL(reportMailto('employer', job)).catch(() => undefined);
            }}
          >
            <Text style={styles.ghostText}>{reported === 'employer' ? 'Employer reported' : 'Report employer'}</Text>
          </Pressable>
        </ScrollView>
        <SocialFooter message={`${job.title} at ${job.company} — Hyderabad jobs on Orbit.`} />
      </SafeAreaView>
      <ApplySheet job={job} visible={applyOpen} onClose={() => setApplyOpen(false)} />
    </View>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  safe: { flex: 1 },
  listView: { flex: 1 },
  back: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4 },
  backText: { fontFamily: fonts.medium, fontSize: 15, color: colors.ink },
  body: { paddingHorizontal: 24, paddingBottom: 24 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  initial: { color: colors.white, fontFamily: fonts.semiBold, fontSize: 22 },
  title: { fontFamily: fonts.semiBold, fontSize: 28, letterSpacing: -0.6, color: colors.ink },
  company: { fontFamily: fonts.regular, fontSize: 16, color: colors.muted, marginTop: 6 },
  salary: { fontFamily: fonts.semiBold, fontSize: 20, color: colors.ink, marginTop: 12 },
  tags: { fontFamily: fonts.regular, fontSize: 14, color: colors.label, marginTop: 8, lineHeight: 20 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  badge: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: colors.white,
  },
  badgeText: { fontFamily: fonts.medium, fontSize: 10, color: colors.ink },
  reply: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 10 },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  cardLabel: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.ink, marginBottom: 6 },
  cardBody: { fontFamily: fonts.medium, fontSize: 15, color: colors.ink, marginTop: 2 },
  muted: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 4 },
  primary: {
    marginTop: 24,
    backgroundColor: colors.black,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: { color: colors.white, fontFamily: fonts.medium, fontSize: 15 },
  ghost: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  ghostText: { fontFamily: fonts.medium, fontSize: 15, color: colors.ink },
  pressed: { opacity: 0.88 },
});
