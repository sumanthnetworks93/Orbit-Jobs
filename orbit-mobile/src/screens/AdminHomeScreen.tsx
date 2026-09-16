import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { OrbitBackground } from '../components/OrbitBackground';
import { countFrozenHydJobs } from '../hyd/filter';
import {
  getPlatformControls,
  PLATFORM_CONTROL_FIELDS,
  setPlatformControl,
  type PlatformControlKey,
  type PlatformControls,
} from '../services/adminControl';
import { MEMBERSHIP_PLANS, rupees } from '../services/employerBilling';
import { hydrateJobOverrides } from '../services/adminJobs';
import {
  getAdminProfiles,
  pendingAdminProfiles,
  reviewAdminProfile,
  verifiedAdminProfiles,
  type AdminProfile,
} from '../services/adminModeration';
import { adminStyles as styles } from './adminStyles';

export function AdminHomeScreen() {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [controls, setControls] = useState<PlatformControls | null>(null);
  const [frozenCount, setFrozenCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      void Promise.all([getAdminProfiles(), getPlatformControls(), hydrateJobOverrides()]).then(
        ([nextProfiles, nextControls]) => {
          setProfiles(nextProfiles);
          setControls(nextControls);
          setFrozenCount(countFrozenHydJobs());
        },
      );
    }, []),
  );

  const pending = pendingAdminProfiles(profiles);

  async function review(id: string, status: 'verified' | 'rejected') {
    const next = await reviewAdminProfile(
      id,
      status,
      status === 'verified' ? 'Approved by Super Admin' : 'Needs more proof',
    );
    setProfiles(next);
  }

  async function toggle(key: PlatformControlKey, value: boolean) {
    const next = await setPlatformControl(key, value);
    setControls(next);
    setFrozenCount(countFrozenHydJobs());
  }

  return (
    <View style={styles.root} testID="admin-screen">
      <OrbitBackground theme="blobs" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.kicker}>Super Admin</Text>
          <Text style={styles.title}>Control</Text>
          <Text style={styles.subtitle}>
            Platform switches, people, and jobs from one desk.
          </Text>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{pending.length}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{verifiedAdminProfiles(profiles).length}</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{frozenCount}</Text>
              <Text style={styles.statLabel}>Frozen jobs</Text>
            </View>
          </View>

          <Text style={styles.section}>Platform</Text>
          {controls
            ? PLATFORM_CONTROL_FIELDS.map((field) => {
                const on = controls[field.key];
                return (
                  <Pressable
                    key={field.key}
                    testID={`admin-control-${field.key}`}
                    onPress={() => void toggle(field.key, !on)}
                    style={({ pressed }) => [styles.toggleRow, pressed && styles.pressed]}
                  >
                    <View style={styles.toggleCopy}>
                      <Text style={styles.toggleLabel}>{field.label}</Text>
                      <Text style={styles.toggleHelper}>{field.helper}</Text>
                    </View>
                    <View style={[styles.pill, on && styles.pillOn]}>
                      <Text style={[styles.pillText, on && styles.pillTextOn]}>{on ? 'On' : 'Off'}</Text>
                    </View>
                  </Pressable>
                );
              })
            : null}

          <Text style={styles.section}>Hiring plans</Text>
          <Text style={styles.subtitle}>
            Employers get 2 jobs free each month. Every extra job is ₹25. Memberships add included posts.
          </Text>
          {MEMBERSHIP_PLANS.map((plan) => (
            <View key={plan.id} style={styles.card} testID={`admin-plan-${plan.id}`}>
              <Text style={styles.cardTitle}>{plan.name}</Text>
              <Text style={styles.cardMeta}>
                {plan.priceInr === 0 ? '₹0 / month' : `${rupees(plan.priceInr)} / month`} · {plan.jobsPerMonth} included · extras {rupees(plan.extraJobInr)}
              </Text>
            </View>
          ))}

          <Text style={styles.section}>Trust & safety</Text>
          <Text style={styles.subtitle}>
            Mock review queue. Verify seekers and employers before they show a verified profile.
          </Text>
          {pending.length === 0 ? <Text style={styles.empty}>No pending profiles.</Text> : null}
          {pending.map((profile) => (
            <View key={profile.id} style={styles.card} testID={`admin-pending-${profile.id}`}>
              <Text style={styles.cardTitle}>{profile.name}</Text>
              <Text style={styles.cardMeta}>
                {profile.role}
                {profile.company ? ` · ${profile.company}` : ''}
              </Text>
              <View style={styles.row}>
                <Pressable
                  testID={`admin-approve-${profile.id}`}
                  onPress={() => void review(profile.id, 'verified')}
                  style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
                >
                  <Text style={styles.primaryText}>Verify profile</Text>
                </Pressable>
                <Pressable
                  testID={`admin-reject-${profile.id}`}
                  onPress={() => void review(profile.id, 'rejected')}
                  style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
                >
                  <Text style={styles.secondaryText}>Reject</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
