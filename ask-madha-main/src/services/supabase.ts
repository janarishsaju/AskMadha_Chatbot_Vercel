import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const SUPABASE_URL: string =
  (Constants.expoConfig?.extra as any)?.supabaseUrl ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  '';

const SUPABASE_ANON_KEY: string =
  (Constants.expoConfig?.extra as any)?.supabaseAnonKey ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.'
  );
}

/**
 * Hybrid storage adapter for Supabase session persistence.
 * Uses SecureStore (Keychain/Keystore) when the value fits (~2KB limit on Android),
 * falling back to AsyncStorage for larger session blobs.
 */
const LARGE_VALUE_PREFIX = 'supabase_';
const SECURE_STORE_MAX_BYTES = 2000;

const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    const secureValue = await SecureStore.getItem(key);
    if (secureValue !== null) return secureValue;
    return AsyncStorage.getItem(LARGE_VALUE_PREFIX + key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (value.length <= SECURE_STORE_MAX_BYTES) {
      await SecureStore.setItem(key, value);
    } else {
      await SecureStore.deleteItemAsync(key).catch(() => {});
      await AsyncStorage.setItem(LARGE_VALUE_PREFIX + key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    await SecureStore.deleteItemAsync(key).catch(() => {});
    await AsyncStorage.removeItem(LARGE_VALUE_PREFIX + key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
