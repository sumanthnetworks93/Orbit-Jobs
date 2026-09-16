import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LegalSupportBlock } from '../components/LegalSheet';
import { OrbitBackground } from '../components/OrbitBackground';
import { useAuth } from '../context/AuthContext';
import { signOutUser } from '../services/auth';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export function EmployerProfileScreen() {
  const { user } = useAuth();

  async function signOut() {
    try {
      await signOutUser();
    } catch (error) {
      Alert.alert('Sign out', error instanceof Error ? error.message : 'Could not sign out.');
    }
  }

  return (
    <View style={styles.root} testID="employer-profile-screen">
      <OrbitBackground theme="blobs" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.kicker}>Company</Text>
          <Text style={styles.title}>{user?.company ?? 'Employer'}</Text>
          <Text style={styles.subtitle}>
            {user?.name} · {user?.email}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Mock employer · not verified by admin yet</Text>
          </View>
          <LegalSupportBlock />
          <Pressable
            testID="employer-sign-out"
            onPress={() => void signOut()}
            style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryText}>Sign out</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  safe: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 20 },
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
  },
  badge: {
    marginTop: 16,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  badgeText: { fontFamily: fonts.medium, fontSize: 13, color: colors.ink },
  secondary: {
    height: 54,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    backgroundColor: colors.white,
  },
  secondaryText: { fontFamily: fonts.medium, fontSize: 16, color: colors.ink },
  pressed: { opacity: 0.88 },
});
