import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/utils/constants';
import { CacheKeyParts, ScreenCacheId } from './cacheTypes';

export const SCREEN_CACHE_PREFIX = '@screen_cache:';

/**
 * Builds a stable AsyncStorage key for a screen cache entry.
 * Always includes company + branch so data never leaks across contexts.
 */
export const buildScreenCacheKey = (parts: CacheKeyParts): string => {
  const segments = [
    SCREEN_CACHE_PREFIX + parts.screenId,
    parts.companyUniqueName || 'unknown-company',
    parts.branchUniqueName || 'unknown-branch',
  ];

  if (parts.startDate) {
    segments.push(parts.startDate);
  }
  if (parts.endDate) {
    segments.push(parts.endDate);
  }
  if (parts.extra) {
    segments.push(parts.extra);
  }

  return segments.join('|');
};

/**
 * Resolves active company/branch from AsyncStorage for cache key building.
 */
export const getCacheScope = async (
  screenId: ScreenCacheId,
  options?: {
    branchUniqueName?: string;
    startDate?: string;
    endDate?: string;
    extra?: string;
  },
): Promise<string> => {
  const [companyUniqueName, activeBranchUniqueName] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName),
    AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName),
  ]);

  return buildScreenCacheKey({
    screenId,
    companyUniqueName: companyUniqueName ?? '',
    branchUniqueName: options?.branchUniqueName || activeBranchUniqueName || ' ',
    startDate: options?.startDate,
    endDate: options?.endDate,
    extra: options?.extra,
  });
};
