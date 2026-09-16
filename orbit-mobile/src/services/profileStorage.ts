import AsyncStorage from '@react-native-async-storage/async-storage';

const DISPLAY_NAME_KEY = 'orbit_profile_display_name';
const NOTIFICATIONS_KEY = 'orbit_profile_notifications';

export async function getDisplayName(): Promise<string | null> {
  return AsyncStorage.getItem(DISPLAY_NAME_KEY);
}

export async function setDisplayName(name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) {
    await AsyncStorage.removeItem(DISPLAY_NAME_KEY);
    return;
  }
  await AsyncStorage.setItem(DISPLAY_NAME_KEY, trimmed);
}

export async function getNotificationsEnabled(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
  return raw !== '0';
}

export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(NOTIFICATIONS_KEY, enabled ? '1' : '0');
}
