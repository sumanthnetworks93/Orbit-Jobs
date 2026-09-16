import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { OrbitBackground } from '../components/OrbitBackground';
import { useAuth } from '../context/AuthContext';
import type { EmployerTabParamList } from '../navigation/types';
import { getEmployerApplicants, getEmployerListings, type EmployerListing } from '../services/employerJobs';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export function EmployerHomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<BottomTabNavigationProp<EmployerTabParamList>>();
  const [listings, setListings] = useState<EmployerListing[]>([]);
  const applicants = getEmployerApplicants();

  useFocusEffect(
    useCallback(() => {
      getEmployerListings().then(setListings).catch(() => undefined);
    }, []),
  );

  const openCount = listings.filter((job) => job.status === 'open').length;
  const applicantCount = listings.reduce((sum, job) => sum + job.applicants, 0);

  return (
    <View style={styles.root} testID="employer-screen">
      <OrbitBackground theme="blobs" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.kicker}>Employer</Text>
          <Text style={styles.title}>{user?.company ?? 'Your company'}</Text>
          <Text style={styles.subtitle}>
            {user?.name} · mock hiring workspace. Post roles and review applicants.
          </Text>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{openCount}</Text>
              <Text style={styles.statLabel}>Open roles</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{applicantCount}</Text>
              <Text style={styles.statLabel}>Applicants</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{listings.length}</Text>
              <Text style={styles.statLabel}>Listings</Text>
            </View>
          </View>

          <Pressable
            testID="employer-go-post"
            onPress={() => navigation.navigate('EmployerPost')}
            style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
          >
            <Text style={styles.primaryText}>Post a role</Text>
          </Pressable>

          <Text style={styles.section}>Your listings</Text>
          {listings.map((job) => (
            <View key={job.id} style={styles.card} testID={`employer-job-${job.id}`}>
              <Text style={styles.cardTitle}>{job.title}</Text>
              <Text style={styles.cardMeta}>
                {job.location} · {job.jobType} · {job.salary}
              </Text>
              <Text style={styles.cardTags}>{job.tags}</Text>
              <Text style={styles.cardFoot}>
                {job.applicants} applicants · {job.postedAt} · {job.status}
              </Text>
            </View>
          ))}

          <Text style={styles.section}>Recent applicants</Text>
          {applicants.map((person) => (
            <View key={person.id} style={styles.card} testID={`employer-applicant-${person.id}`}>
              <Text style={styles.cardTitle}>{person.name}</Text>
              <Text style={styles.cardMeta}>{person.role} · {person.appliedAt}</Text>
              <Text style={styles.cardTags}>{person.note}</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  safe: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  kicker: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.label,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 32,
    letterSpacing: -0.7,
    color: colors.ink,
    marginTop: 8,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.muted,
    marginTop: 8,
    maxWidth: 340,
  },
  stats: { flexDirection: 'row', gap: 10, marginTop: 24 },
  stat: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    backgroundColor: colors.white,
  },
  statValue: { fontFamily: fonts.semiBold, fontSize: 22, color: colors.ink },
  statLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 4 },
  primary: {
    height: 54,
    borderRadius: 999,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  primaryText: { fontFamily: fonts.medium, fontSize: 16, color: colors.white },
  pressed: { opacity: 0.88 },
  section: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.ink,
    marginTop: 28,
    marginBottom: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    backgroundColor: colors.white,
  },
  cardTitle: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.ink },
  cardMeta: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 4 },
  cardTags: { fontFamily: fonts.regular, fontSize: 13, color: colors.ink, marginTop: 8 },
  cardFoot: { fontFamily: fonts.regular, fontSize: 12, color: colors.label, marginTop: 10 },
});
