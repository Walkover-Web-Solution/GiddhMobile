import AsyncStorage from '@react-native-async-storage/async-storage';
import { SCREEN_CACHE_PREFIX } from './cacheKeys';
import { CachedEntry } from './cacheTypes';

/**
 * Reads a cached screen payload. Returns null when missing or invalid.
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as CachedEntry<T>;
    if (!parsed || typeof parsed !== 'object' || parsed.data === undefined) {
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.log('screenCache.getCache error', error);
    return null;
  }
};

/**
 * Saves a screen payload. Overwrites any previous value for the same key.
 */
export const setCache = async <T>(key: string, data: T): Promise<void> => {
  try {
    const entry: CachedEntry<T> = {
      data,
      savedAt: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.log('screenCache.setCache error', error);
  }
};

/**
 * Removes one cache entry.
 */
export const removeCache = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.log('screenCache.removeCache error', error);
  }
};

/**
 * Clears all screen-cache keys (prefix-scoped). Safe on logout / company change.
 */
export const clearAllScreenCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key) => key.startsWith(SCREEN_CACHE_PREFIX));
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch (error) {
    console.log('screenCache.clearAllScreenCache error', error);
  }
};
