import { Platform } from 'react-native';
import { isLoopbackHost, rewriteHost } from '../hyd/previewUrl';

const localhost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

function resolveApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL ?? `http://${localhost}:5189`;
  if (typeof window === 'undefined') return configured;
  const host = window.location.hostname;
  if (!host || isLoopbackHost(host)) return configured;
  try {
    return rewriteHost(configured, host);
  } catch {
    return `http://${host}:5189`;
  }
}

export const API_BASE_URL = resolveApiBaseUrl();
