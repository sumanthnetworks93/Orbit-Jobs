import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { OrbitBackground } from '../components/OrbitBackground';
import {
  getAdminProfiles,
  reviewAdminProfile,
  setAdminProfileRole,
  setAdminProfileSuspended,
  type AdminProfile,
} from '../services/adminModeration';
import { adminStyles as styles } from './adminStyles';

function badgeLabel(profile: AdminProfile) {
  if (profile.suspended) return 'Suspended';
  return profile.status === 'verified' ? 'Verified profile' : `${profile.status} profile`;
}

export function AdminPeopleScreen() {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);

  useFocusEffect(
    useCallback(() => {
      getAdminProfiles().then(setProfiles).catch(() => undefined);
    }, []),
  );

  return (
    <View style={styles.root} testID="admin-people-screen">
      <OrbitBackground theme="blobs" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.kicker}>Directory</Text>
          <Text style={styles.title}>People</Text>
          <Text style={styles.subtitle}>
            Verify, suspend, or change a role. Super Admin control over seekers and employers.
          </Text>
          {profiles.map((profile) => (
            <View key={profile.id} style={styles.card} testID={`admin-user-${profile.id}`}>
              <Text style={styles.badge}>{badgeLabel(profile)}</Text>
              <Text style={styles.cardTitle}>{profile.name}</Text>
              <Text style={styles.cardMeta}>
                {profile.role}
                {profile.company ? ` · ${profile.company}` : ''}
              </Text>
              {profile.note ? <Text style={styles.note}>{profile.note}</Text> : null}
              <View style={styles.row}>
                {profile.status === 'pending' && !profile.suspended ? (
                  <Pressable
                    testID={`admin-people-approve-${profile.id}`}
                    onPress={() =>
                      void reviewAdminProfile(profile.id, 'verified', 'Approved by Super Admin').then(setProfiles)
                    }
                    style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
                  >
                    <Text style={styles.primaryText}>Verify</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  testID={profile.suspended ? `admin-restore-${profile.id}` : `admin-suspend-${profile.id}`}
                  onPress={() => void setAdminProfileSuspended(profile.id, !profile.suspended).then(setProfiles)}
                  style={({ pressed }) => [
                    profile.suspended ? styles.primary : styles.secondary,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={profile.suspended ? styles.primaryText : styles.secondaryText}>
                    {profile.suspended ? 'Restore' : 'Suspend'}
                  </Text>
                </Pressable>
                <Pressable
                  testID={`admin-role-${profile.id}`}
                  onPress={() =>
                    void setAdminProfileRole(profile.id, profile.role === 'employer' ? 'seeker' : 'employer').then(
                      setProfiles,
                    )
                  }
                  style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
                >
                  <Text style={styles.secondaryText}>
                    {profile.role === 'employer' ? 'Make seeker' : 'Make employer'}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
