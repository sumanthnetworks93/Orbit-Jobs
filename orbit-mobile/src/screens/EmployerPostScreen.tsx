import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { OrbitBackground } from '../components/OrbitBackground';
import { useAuth } from '../context/AuthContext';
import type { EmployerTabParamList } from '../navigation/types';
import { quoteNextJobPost, recordJobPost, rupees, type JobQuote } from '../services/employerBilling';
import { addEmployerListing } from '../services/employerJobs';
import { getAdminProfiles } from '../services/adminModeration';
import { assertSafeListing } from '../hyd/listingGuard';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export function EmployerPostScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<BottomTabNavigationProp<EmployerTabParamList>>();
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Remote · US');
  const [jobType, setJobType] = useState('Full-time');
  const [salary, setSalary] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [quote, setQuote] = useState<JobQuote | null>(null);

  useFocusEffect(
    useCallback(() => {
      quoteNextJobPost().then(setQuote).catch(() => undefined);
    }, []),
  );

  async function publish() {
    if (!title.trim()) {
      Alert.alert('Post a role', 'Add a role title.');
      return;
    }
    const company = user?.company?.trim() || '';
    const check = assertSafeListing({
      title: title.trim(),
      company,
      location: location.trim(),
      salary: salary.trim(),
      tags: tags.trim(),
      jobType: jobType.trim(),
    });
    if (!check.ok) {
      Alert.alert('Post a role', check.error);
      return;
    }
    setSaving(true);
    try {
      const profiles = await getAdminProfiles();
      const verified = profiles.some(
        (profile) =>
          profile.role === 'employer' &&
          profile.status === 'verified' &&
          !profile.suspended &&
          (profile.email === user?.email || profile.company === company),
      );
      const nextQuote = await quoteNextJobPost();
      await addEmployerListing({
        title: title.trim(),
        location: location.trim(),
        jobType: jobType.trim() || 'Full-time',
        salary: salary.trim(),
        tags: tags.trim() || 'General',
        holdForReview: !verified,
      });
      await recordJobPost(nextQuote);
      setTitle('');
      setSalary('');
      setTags('');
      navigation.navigate('EmployerHome');
    } catch (error) {
      Alert.alert('Post a role', error instanceof Error ? error.message : 'Could not save the listing.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.root} testID="employer-post-screen">
      <OrbitBackground theme="blobs" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.kicker}>Hiring</Text>
          <Text style={styles.title}>Post a role</Text>
          <Text style={styles.subtitle} testID="employer-post-quota">
            {quote
              ? quote.chargeInr === 0
                ? `${quote.remainingIncluded} of ${quote.included} included jobs left this month. Extra jobs are ₹25.`
                : `Included jobs are used. This post is ${rupees(quote.chargeInr)}.`
              : 'Two jobs each month are free. Extra jobs are ₹25.'}
          </Text>
          <Text style={styles.legalNote}>
            Unverified recruiters stay in review. Do not charge candidates fees. Salary, location, and company name must be accurate. Posting here does not replace statutory vacancy-notification duties. GST invoices will be issued by the registered Orbit entity.
          </Text>

          <Field label="Role title" testID="employer-post-title" value={title} onChange={setTitle} placeholder="Founding Engineer" />
          <Field label="Company" value={user?.company ?? 'Northline'} onChange={() => undefined} editable={false} />
          <Field label="Location" testID="employer-post-location" value={location} onChange={setLocation} placeholder="Hyderabad · Hybrid" />
          <Field label="Type" value={jobType} onChange={setJobType} placeholder="Full-time" />
          <Field label="Salary" testID="employer-post-salary" value={salary} onChange={setSalary} placeholder="$170k or ₹30L" />
          <Field label="Tags" value={tags} onChange={setTags} placeholder="TypeScript · Product" />

          <Pressable
            testID="employer-publish"
            disabled={saving}
            onPress={() => void publish()}
            style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
          >
            <Text style={styles.primaryText}>
              {saving ? 'Publishing…' : quote?.chargeInr ? `Pay ${rupees(quote.chargeInr)} and publish` : 'Publish role'}
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  testID,
  editable = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  testID?: string;
  editable?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        testID={testID}
        value={value}
        editable={editable}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.label}
        style={[styles.input, !editable && styles.inputLocked]}
      />
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
    marginBottom: 12,
  },
  legalNote: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors.label,
    marginBottom: 18,
  },
  field: { marginBottom: 14 },
  label: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted, marginBottom: 6 },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.white,
  },
  inputLocked: { color: colors.muted },
  primary: {
    height: 54,
    borderRadius: 999,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  primaryText: { fontFamily: fonts.medium, fontSize: 16, color: colors.white },
  pressed: { opacity: 0.88 },
});
