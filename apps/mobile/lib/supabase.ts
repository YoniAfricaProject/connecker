import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Check your .env file.');
}

// SecureStore is limited to 2KB per key on iOS keychain. Supabase sessions fit,
// but we chunk defensively to stay safe and fall back to AsyncStorage on web.
const CHUNK_SIZE = 1800;

const ChunkedSecureStore = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') return AsyncStorage.getItem(key);
    const countStr = await SecureStore.getItemAsync(`${key}__count`);
    if (countStr === null) return SecureStore.getItemAsync(key);
    const count = parseInt(countStr, 10);
    const parts: string[] = [];
    for (let i = 0; i < count; i++) {
      const chunk = await SecureStore.getItemAsync(`${key}__${i}`);
      if (chunk === null) return null;
      parts.push(chunk);
    }
    return parts.join('');
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') return AsyncStorage.setItem(key, value);
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.deleteItemAsync(`${key}__count`).catch(() => {});
      return SecureStore.setItemAsync(key, value);
    }
    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK_SIZE) {
      chunks.push(value.slice(i, i + CHUNK_SIZE));
    }
    await SecureStore.setItemAsync(`${key}__count`, String(chunks.length));
    await Promise.all(chunks.map((c, i) => SecureStore.setItemAsync(`${key}__${i}`, c)));
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') return AsyncStorage.removeItem(key);
    const countStr = await SecureStore.getItemAsync(`${key}__count`);
    if (countStr !== null) {
      const count = parseInt(countStr, 10);
      await Promise.all([
        SecureStore.deleteItemAsync(`${key}__count`),
        ...Array.from({ length: count }, (_, i) => SecureStore.deleteItemAsync(`${key}__${i}`)),
      ]);
    }
    await SecureStore.deleteItemAsync(key).catch(() => {});
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ChunkedSecureStore,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
