import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
  useFonts,
} from '@expo-google-fonts/hanken-grotesk';
import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, LogBox, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/hyd/LanguageContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme/colors';

LogBox.ignoreLogs([
  'Clerk: Clerk has been loaded with development keys',
]);

const FALLBACK_CLERK_KEY = 'pk_test_bW9kZXN0LXJlaW5kZWVyLTg4LmNsZXJrLmFjY291bnRzLmRldiQ';
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || FALLBACK_CLERK_KEY;

export default function App() {
  const [fontsLoaded] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
  });

  if (Platform.OS !== 'web' && !fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <SafeAreaProvider>
        <AuthProvider>
          <LanguageProvider>
            <StatusBar style="dark" />
            <RootNavigator />
          </LanguageProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
});
