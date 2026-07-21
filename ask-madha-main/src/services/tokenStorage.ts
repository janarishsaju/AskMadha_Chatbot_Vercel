import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  EXPIRES_AT: 'auth_expires_at',
  USER: 'auth_user',
} as const;

const LARGE_VALUE_PREFIX = 'auth_';
const SECURE_STORE_MAX_BYTES = 2000;

async function secureGet(key: string): Promise<string | null> {
  const secureValue = await SecureStore.getItem(key);
  if (secureValue !== null) return secureValue;
  return AsyncStorage.getItem(LARGE_VALUE_PREFIX + key);
}

async function secureSet(key: string, value: string): Promise<void> {
  if (value.length <= SECURE_STORE_MAX_BYTES) {
    await SecureStore.setItem(key, value);
  } else {
    await SecureStore.deleteItemAsync(key).catch(() => {});
    await AsyncStorage.setItem(LARGE_VALUE_PREFIX + key, value);
  }
}

async function secureDelete(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key).catch(() => {});
  await AsyncStorage.removeItem(LARGE_VALUE_PREFIX + key);
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: any;
}

export async function saveAuthSession(session: AuthSession): Promise<void> {
  await Promise.all([
    secureSet(KEYS.ACCESS_TOKEN, session.access_token),
    secureSet(KEYS.REFRESH_TOKEN, session.refresh_token),
    secureSet(KEYS.EXPIRES_AT, String(session.expires_at)),
    secureSet(KEYS.USER, JSON.stringify(session.user)),
  ]);
}

export async function getAccessToken(): Promise<string | null> {
  return secureGet(KEYS.ACCESS_TOKEN);
}

export async function getRefreshToken(): Promise<string | null> {
  return secureGet(KEYS.REFRESH_TOKEN);
}

export async function getExpiresAt(): Promise<number | null> {
  const raw = await secureGet(KEYS.EXPIRES_AT);
  return raw ? parseInt(raw, 10) : null;
}

export async function getStoredUser(): Promise<any | null> {
  const raw = await secureGet(KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function clearAuthSession(): Promise<void> {
  await Promise.all([
    secureDelete(KEYS.ACCESS_TOKEN),
    secureDelete(KEYS.REFRESH_TOKEN),
    secureDelete(KEYS.EXPIRES_AT),
    secureDelete(KEYS.USER),
  ]);
}

/**
 * Check if the access token is expired or about to expire (within 60s).
 */
export async function isTokenExpired(): Promise<boolean> {
  const expiresAt = await getExpiresAt();
  if (!expiresAt) return true;
  const now = Math.floor(Date.now() / 1000);
  return expiresAt - now < 60;
}
