import { useClerk } from '@clerk/expo';
import { useHostedAuth } from '@clerk/expo/hosted-auth';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export function ClerkAuthActions() {
  const clerk = useClerk();
  const { startHostedAuth } = useHostedAuth();
  const [loading, setLoading] = useState<'sign-in' | 'sign-up' | null>(null);

  async function start(mode: 'sign-in' | 'sign-up') {
    try {
      setLoading(mode);
      if (Platform.OS === 'web') {
        if (!clerk.loaded) {
          throw new Error('Clerk is still loading. Try again in a moment.');
        }
        if (mode === 'sign-up') {
          clerk.openSignUp({});
        } else {
          clerk.openSignIn({});
        }
        return;
      }
      await startHostedAuth({ mode });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed.';
      Alert.alert(mode === 'sign-up' ? 'Sign up' : 'Sign in', message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      <Pressable
        testID="auth-sign-in"
        accessibilityLabel="Sign in"
        disabled={loading !== null}
        onPress={() => start('sign-in')}
        style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
      >
        <Text style={styles.primaryText}>{loading === 'sign-in' ? 'Opening…' : 'Sign in'}</Text>
      </Pressable>
      <Pressable
        testID="auth-sign-up"
        accessibilityLabel="Sign up"
        disabled={loading !== null}
        onPress={() => start('sign-up')}
        style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
      >
        <Text style={styles.secondaryText}>{loading === 'sign-up' ? 'Opening…' : 'Sign up'}</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  primary: {
    height: 54,
    borderRadius: 999,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.white,
  },
  secondary: {
    height: 54,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.ink,
  },
  pressed: {
    opacity: 0.88,
  },
});
