/**
 * Client-side cache utilities for API responses
 */

interface CacheItem<T> {
  data: T;
  expiry: number;
}

const CACHE_DURATION = 20 * 60 * 1000; // 20 хвилин

// In-memory cache (faster than localStorage, especially on mobile)
const memoryCache = new Map<string, CacheItem<unknown>>();

/**
 * Get data from cache (checks memory first, then localStorage)
 */
export function getCachedData<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  // First, check in-memory cache (fastest)
  const memCached = memoryCache.get(key) as CacheItem<T> | undefined;
  if (memCached) {
    const now = Date.now();
    if (now < memCached.expiry) {
      return memCached.data;
    } else {
      memoryCache.delete(key);
    }
  }

  // Fallback to localStorage
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const item: CacheItem<T> = JSON.parse(cached);
    const now = Date.now();

    if (now >= item.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    // Restore to memory cache
    memoryCache.set(key, item);
    return item.data;
  } catch (error) {
    console.error("Error reading from cache:", error);
    return null;
  }
}

/**
 * Set data to cache (stores in both memory and localStorage)
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

  // Store in memory cache (fastest access)
  memoryCache.set(key, item);

  // Also store in localStorage (persists across page reloads)
  try {
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    // localStorage quota exceeded or disabled - memory cache will still work
    console.warn("Failed to write to localStorage, using memory cache only:", error);
  }
}

/**
 * Clear specific cache key (from both memory and localStorage)
 */
export function clearCache(key: string): void {
  if (typeof window === "undefined") return;
  memoryCache.delete(key);
  localStorage.removeItem(key);
}

/**
 * Clear all cache with a prefix (from both memory and localStorage)
 */
export function clearCacheByPrefix(prefix: string): void {
  if (typeof window === "undefined") return;

  // Clear from memory cache
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }

  // Clear from localStorage
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
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
    console.log(`Using cached data for: ${url}`);
    return cached;
  }

  // Fetch from server
  console.log(`Fetching from server: ${url}`);
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

