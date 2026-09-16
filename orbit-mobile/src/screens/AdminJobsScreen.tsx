import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { OrbitBackground } from '../components/OrbitBackground';
import { HYD_JOBS } from '../hyd/seed';
import {
  getJobOverride,
  hydrateJobOverrides,
  toggleJobFrozen,
  toggleJobHidden,
  type JobOverrides,
} from '../services/adminJobs';
import { adminStyles as styles } from './adminStyles';

function statusLabel(jobId: number, overrides: JobOverrides) {
  const override = overrides[jobId] ?? getJobOverride(jobId);
  const seedFrozen = HYD_JOBS.find((job) => job.id === jobId)?.frozen;
  if (override?.hidden) return 'Hidden from seekers';
  const frozen = override?.frozen ?? Boolean(seedFrozen);
  if (frozen) return 'Frozen';
  return 'Live';
}

export function AdminJobsScreen() {
  const [overrides, setOverrides] = useState<JobOverrides>({});

  useFocusEffect(
    useCallback(() => {
      hydrateJobOverrides().then(setOverrides).catch(() => undefined);
    }, []),
  );

  return (
    <View style={styles.root} testID="admin-jobs-screen">
      <OrbitBackground theme="blobs" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.kicker}>Listings</Text>
          <Text style={styles.title}>Jobs</Text>
          <Text style={styles.subtitle}>
            Freeze a role to pull it from the seeker feed. Hide it completely if it should not appear at all.
          </Text>
          {HYD_JOBS.map((job) => {
            const override = overrides[job.id] ?? {};
            const frozen = override.frozen ?? Boolean(job.frozen);
            const hidden = Boolean(override.hidden);
            return (
              <View key={job.id} style={styles.card} testID={`admin-job-${job.id}`}>
                <Text style={styles.badge}>{statusLabel(job.id, overrides)}</Text>
                <Text style={styles.cardTitle}>{job.title}</Text>
                <Text style={styles.cardMeta}>
                  {job.company} · {job.area} · #{job.id}
                </Text>
                <View style={styles.row}>
                  <Pressable
                    testID={`admin-freeze-${job.id}`}
                    onPress={() => void toggleJobFrozen(job.id, frozen).then(setOverrides)}
                    style={({ pressed }) => [frozen ? styles.primary : styles.secondary, pressed && styles.pressed]}
                  >
                    <Text style={frozen ? styles.primaryText : styles.secondaryText}>
                      {frozen ? 'Unfreeze' : 'Freeze'}
                    </Text>
                  </Pressable>
                  <Pressable
                    testID={`admin-hide-${job.id}`}
                    onPress={() => void toggleJobHidden(job.id, hidden).then(setOverrides)}
                    style={({ pressed }) => [hidden ? styles.primary : styles.secondary, pressed && styles.pressed]}
                  >
                    <Text style={hidden ? styles.primaryText : styles.secondaryText}>
                      {hidden ? 'Show' : 'Hide'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
