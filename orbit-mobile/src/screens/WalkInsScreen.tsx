import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ApplySheet } from '../components/ApplySheet';
import { SocialFooter } from '../components/SocialFooter';
import { JobRow } from '../components/JobRow';
import { OrbitBackground } from '../components/OrbitBackground';
import { useLanguage } from '../hyd/LanguageContext';
import { visibleWalkInJobs } from '../hyd/filter';
import type { WalkInsStackParamList } from '../navigation/types';
import { hydratePlatformControls } from '../services/adminControl';
import { hydrateJobOverrides } from '../services/adminJobs';
import type { Job } from '../types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export function WalkInsScreen() {
  const { copy } = useLanguage();
  const navigation = useNavigation<NativeStackNavigationProp<WalkInsStackParamList>>();
  const [jobs, setJobs] = useState(() => visibleWalkInJobs());
  const [applyJob, setApplyJob] = useState<Job | null>(null);

  useFocusEffect(
    useCallback(() => {
      void Promise.all([hydrateJobOverrides(), hydratePlatformControls()]).then(() => {
        setJobs(visibleWalkInJobs());
      });
    }, []),
  );

  return (
    <View style={styles.root} testID="walkins-screen">
      <OrbitBackground theme="dots" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>HYDERABAD THIS WEEK</Text>
          <Text style={styles.title}>{copy.walkins}</Text>
          <Text style={styles.sub}>Date, time, venue, who to ask for. No 3-week recruiter loop.</Text>
        </View>
        <ScrollView style={styles.listView} contentContainerStyle={styles.list}>
          {jobs.map((job) => (
            <View key={job.id} style={styles.card} testID={`walkin-${job.id}`}>
              <Text style={styles.when}>
                {job.walkIn?.date} · {job.walkIn?.time}
              </Text>
              <Text style={styles.venue}>{job.walkIn?.venue}</Text>
              <Text style={styles.ask}>
                Ask for {job.walkIn?.askFor} · Bring {job.walkIn?.bring}
              </Text>
              <JobRow
                job={job}
                onApply={setApplyJob}
                onOpen={(next) => navigation.navigate('JobDetail', { job: next })}
              />
            </View>
          ))}
        </ScrollView>
        <SocialFooter message="Hyderabad walk-in drives this week on Orbit." />
        <ApplySheet job={applyJob} visible={applyJob !== null} onClose={() => setApplyJob(null)} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  safe: { flex: 1 },
  listView: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12, backgroundColor: colors.canvas, zIndex: 1 },
  eyebrow: { fontFamily: fonts.semiBold, fontSize: 11, letterSpacing: 1.6, color: colors.label },
  title: { fontFamily: fonts.semiBold, fontSize: 34, letterSpacing: -0.8, color: colors.ink, marginTop: 6 },
  sub: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginTop: 6 },
  list: { paddingHorizontal: 24, paddingBottom: 24 },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingTop: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  when: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.ink, paddingHorizontal: 4 },
  venue: { fontFamily: fonts.medium, fontSize: 14, color: colors.ink, marginTop: 4, paddingHorizontal: 4 },
  ask: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 2, paddingHorizontal: 4 },
});
