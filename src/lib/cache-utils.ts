/**
 * Utility functions for client-side caching
 */

// Cache duration in milliseconds
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached data from sessionStorage
 * @param key The cache key
 * @returns The cached data or null if not found or expired
 */
export function getCachedData<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const cachedItem = sessionStorage.getItem(key);
    if (!cachedItem) return null;

    const { data, timestamp } = JSON.parse(cachedItem);
    const now = Date.now();
    const age = now - timestamp;

    // Return data if cache is still valid
    if (age < CACHE_DURATION) {
      return data as T;
    }

    // Cache expired, remove it
    sessionStorage.removeItem(key);
    return null;
  } catch (error) {
    console.error(`Error retrieving cached data for key ${key}:`, error);
    return null;
  }
}

/**
 * Set data in sessionStorage cache
 * @param key The cache key
 * @param data The data to cache
 */
export function setCachedData<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(
      key,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      }),
    );
  } catch (error) {
    console.error(`Error caching data for key ${key}:`, error);
  }
}

/**
 * Clear a specific cache item
 * @param key The cache key to clear
 */
export function clearCacheItem(key: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(key);
}

/**
 * Clear all cache items for a user
 * @param userId The user ID
 */
export function clearUserCache(userId: string): void {
  if (typeof window === "undefined") return;

  clearCacheItem(`subscription-${userId}`);
  clearCacheItem(`headshots-${userId}`);
  clearCacheItem(`user-credits-${userId}`);
}

/**
 * Clear all cache when user logs out
 */
export function clearAllCache(): void {
  if (typeof window === "undefined") return;

  // Only clear our app's cache items, not everything in sessionStorage
  const keysToRemove: string[] = [];

  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (
      key &&
      (key.startsWith("subscription-") ||
        key.startsWith("headshots-") ||
        key.startsWith("user-credits-") ||
        key === "current-user")
    ) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => sessionStorage.removeItem(key));
}
