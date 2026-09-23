import { Platform } from 'react-native';
import { isLoopbackHost, rewriteHost } from '../hyd/previewUrl';

const localhost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export function resolveApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL ?? `http://${localhost}:5189`;

  // In web browsers, rewrite loopback hosts if accessed from another IP/domain
  if (Platform.OS === 'web') {
    const host = typeof window !== 'undefined' && window?.location ? window.location.hostname : undefined;
    if (!host || isLoopbackHost(host)) return configured;
    try {
      return rewriteHost(configured, host);
    } catch {
      return `http://${host}:5189`;
    }
  }

  // On native devices running in development (Expo Go), rewrite localhost to Metro packager host IP
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Constants = require('expo-constants')?.default ?? require('expo-constants');
    const hostUri =
      Constants?.expoConfig?.hostUri ??
      Constants?.manifest2?.extra?.expoGo?.debuggerHost ??
      Constants?.manifest?.debuggerHost;
    if (hostUri) {
      const devHost = hostUri.split(':')[0];
      if (devHost && !isLoopbackHost(devHost)) {
        return rewriteHost(configured, devHost);
      }
    }
  } catch {
    // Graceful fallback to configured host if expo-constants is unavailable
  }

  return configured;
}

export const API_BASE_URL = resolveApiBaseUrl();
