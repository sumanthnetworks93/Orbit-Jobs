import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LegalSupportBlock } from '../components/LegalSheet';
import { OrbitBackground } from '../components/OrbitBackground';
import { useAuth } from '../context/AuthContext';
import { signOutUser } from '../services/auth';
import { adminStyles as styles } from './adminStyles';

const PERMISSIONS = [
  'Verify and reject seeker and employer profiles',
  'Suspend or restore accounts',
  'Freeze and hide Hyderabad jobs',
  'Toggle guest apply, WhatsApp relay, and job review',
  'Turn maintenance mode on for the seeker feed',
  'Hiring plans: 2 free jobs a month, then ₹25 per extra job',
];

export function AdminProfileScreen() {
  const { user } = useAuth();

  async function signOut() {
    try {
      await signOutUser();
    } catch (error) {
      Alert.alert('Sign out', error instanceof Error ? error.message : 'Could not sign out.');
    }
  }

  return (
    <View style={styles.root} testID="admin-profile-screen">
      <OrbitBackground theme="blobs" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.kicker}>Staff</Text>
          <Text style={styles.title}>{user?.name ?? 'Super Admin'}</Text>
          <Text style={styles.subtitle}>{user?.email}</Text>
          <View style={styles.staffBadge}>
            <Text style={styles.staffBadgeText}>Super Admin · Orbit Control</Text>
          </View>
          {PERMISSIONS.map((item) => (
            <Text key={item} style={styles.permission}>
              {item}
            </Text>
          ))}
          <LegalSupportBlock />
          <Pressable
            testID="admin-sign-out"
            onPress={() => void signOut()}
            style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryText}>Sign out</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
