import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'cache:';
const DEFAULT_TTL_MS = 10 * 60 * 1000;

type Entry<T> = { v: T; t: number; ttl: number };

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as Entry<T>;
    if (Date.now() - entry.t > entry.ttl) return null;
    return entry.v;
  } catch {
    return null;
  }
}

export async function cacheGetStale<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (!raw) return null;
    return (JSON.parse(raw) as Entry<T>).v;
  } catch {
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS): Promise<void> {
  try {
    const entry: Entry<T> = { v: value, t: Date.now(), ttl: ttlMs };
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {}
}

export async function cacheRemove(key: string): Promise<void> {
  try { await AsyncStorage.removeItem(PREFIX + key); } catch {}
}

export async function cacheWrap<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = DEFAULT_TTL_MS,
): Promise<T> {
  const fresh = await cacheGet<T>(key);
  if (fresh !== null) return fresh;
  try {
    const value = await fetcher();
    await cacheSet(key, value, ttlMs);
    return value;
  } catch (e) {
    const stale = await cacheGetStale<T>(key);
    if (stale !== null) return stale;
    throw e;
  }
}
