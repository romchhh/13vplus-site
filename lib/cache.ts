/**
 * Client-side cache utilities for API responses
 * OPTIMIZED FOR MOBILE: Memory-only cache to avoid slow localStorage operations
 */

interface CacheItem<T> {
  data: T;
  expiry: number;
}

const CACHE_DURATION = 20 * 60 * 1000; // 20 minutes

// In-memory cache ONLY (much faster on mobile, especially iOS Safari)
// NOTE: This cache will be cleared on page reload, but that's acceptable
// because server-side caching (ISR) and HTTP caching will handle persistence
const memoryCache = new Map<string, CacheItem<unknown>>();

/**
 * Get data from cache (memory-only for mobile speed)
 */
export function getCachedData<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  const cached = memoryCache.get(key) as CacheItem<T> | undefined;
  if (!cached) return null;

  const now = Date.now();
  if (now < cached.expiry) {
    return cached.data;
  }

  // Expired - remove it
  memoryCache.delete(key);
  return null;
}

/**
 * Set data to cache (memory-only for mobile speed)
 */
export function setCachedData<T>(
  key: string,
  data: T,
  duration: number = CACHE_DURATION
): void {
  if (typeof window === "undefined") return;

  const item: CacheItem<T> = {
    data,
    expiry: Date.now() + duration,
  };

  // Store in memory cache ONLY (10-100x faster on mobile than localStorage)
  memoryCache.set(key, item);
}

/**
 * Clear specific cache key
 */
export function clearCache(key: string): void {
  if (typeof window === "undefined") return;
  memoryCache.delete(key);
}

/**
 * Clear all cache with a prefix
 */
export function clearCacheByPrefix(prefix: string): void {
  if (typeof window === "undefined") return;

  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
}

/**
 * Cached fetch wrapper
 */
export async function cachedFetch<T>(
  url: string,
  cacheKey?: string,
  duration?: number
): Promise<T> {
  const key = cacheKey || `cache_${url}`;

  // Try to get from cache first
  const cached = getCachedData<T>(key);
  if (cached) {
    return cached;
  }

  // Fetch from server
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  const data: T = await response.json();

  // Save to cache
  setCachedData(key, data, duration);

  return data;
}

// Cache keys constants
export const CACHE_KEYS = {
  PRODUCTS: "cache_products",
  COLORS: "cache_colors",
  CATEGORIES: "cache_categories",
  PRODUCT: (id: number) => `cache_product_${id}`,
  PRODUCTS_CATEGORY: (category: string) => `cache_products_category_${category}`,
  PRODUCTS_SEASON: (season: string) => `cache_products_season_${season}`,
  PRODUCTS_SUBCATEGORY: (subcategory: string) =>
    `cache_products_subcategory_${subcategory}`,
};

