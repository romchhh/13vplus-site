"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from "react";

interface BasketItem {
  id: number;
  name: string;
  price: number;
  size: string;
  quantity: number;
  imageUrl: string;
  color?: string;
  discount_percentage?: number;
}

interface BasketContextType {
  items: BasketItem[];
  addItem: (item: BasketItem) => Promise<void>;
  removeItem: (id: number, size: string) => void;
  updateQuantity: (id: number, size: string, quantity: number) => Promise<void>;
  clearBasket: () => void;
}

const BasketContext = createContext<BasketContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "basketItems";

// Stock check cache: stores results for 30 seconds
interface StockCacheEntry {
  available: number;
  timestamp: number;
}

const STOCK_CACHE_DURATION = 30 * 1000; // 30 seconds
const stockCache = new Map<string, StockCacheEntry>();

// Generate cache key for stock check
function getStockCacheKey(productId: number, size: string): string {
  return `stock_${productId}_${size}`;
}

// Get cached stock or null if expired/missing
function getCachedStock(productId: number, size: string): number | null {
  const key = getStockCacheKey(productId, size);
  const cached = stockCache.get(key);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > STOCK_CACHE_DURATION) {
    stockCache.delete(key);
    return null;
  }
  
  return cached.available;
}

// Set cached stock
function setCachedStock(productId: number, size: string, available: number): void {
  const key = getStockCacheKey(productId, size);
  stockCache.set(key, {
    available,
    timestamp: Date.now(),
  });
}

export function BasketProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([]);
  const pendingChecksRef = useRef<Set<string>>(new Set());

  // Load from localStorage only on client side after hydration
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // Handle localStorage read errors
    }
  }, []);

  // Save basket items to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Handle localStorage write errors if needed
    }
  }, [items]);

  async function addItem(newItem: BasketItem): Promise<void> {
    // Get current items state to calculate total quantity
    const currentItems = items;
    
    // Calculate total quantity including items already in basket
    const existingItem = currentItems.find(
      (i) =>
        i.id === newItem.id &&
        i.size === newItem.size &&
        i.color === newItem.color
    );
    const totalQuantity = existingItem
      ? existingItem.quantity + newItem.quantity
      : newItem.quantity;

    // Check cache first
    const cacheKey = getStockCacheKey(newItem.id, newItem.size);
    const cachedStock = getCachedStock(newItem.id, newItem.size);
    
    // If we have cached stock and it's sufficient, skip API call
    if (cachedStock !== null && cachedStock >= totalQuantity) {
      // Optimistic update - add item immediately
      const trackAddToCart = () => {
        if (typeof window !== "undefined" && window.fbq) {
          const value = (newItem.discount_percentage
            ? newItem.price * (1 - newItem.discount_percentage / 100)
            : newItem.price) * newItem.quantity;
          window.fbq("track", "AddToCart", {
            content_name: newItem.name,
            content_ids: [String(newItem.id)],
            content_type: "product",
            value,
            currency: "UAH",
          });
        }
      };

      setItems((prevItems) => {
        const existingIndex = prevItems.findIndex(
          (i) =>
            i.id === newItem.id &&
            i.size === newItem.size &&
            i.color === newItem.color
        );
        if (existingIndex !== -1) {
          const updated = [...prevItems];
          updated[existingIndex].quantity += newItem.quantity;
          trackAddToCart();
          return updated;
        }
        trackAddToCart();
        return [...prevItems, newItem];
      });
      
      // Verify in background (non-blocking)
      checkStockInBackground(newItem.id, newItem.size, totalQuantity);
      return;
    }

    // If cache miss or insufficient, check stock via API
    // Prevent duplicate checks for the same item
    if (pendingChecksRef.current.has(cacheKey)) {
      // Wait a bit and retry
      await new Promise(resolve => setTimeout(resolve, 100));
      return addItem(newItem);
    }

    pendingChecksRef.current.add(cacheKey);
    
    try {
      const response = await fetch("/api/products/check-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              product_id: newItem.id,
              size: newItem.size,
              quantity: totalQuantity,
            },
          ],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        const available = data.insufficientItems?.[0]?.available ?? 0;
        setCachedStock(newItem.id, newItem.size, available);
        throw new Error(
          available > 0
            ? `Недостатньо товару в наявності. Доступно: ${available} шт.`
            : "Недостатньо товару в наявності"
        );
      }

      const data = await response.json();
      // Cache the successful check result
      if (data.stockChecks?.[0]) {
        setCachedStock(newItem.id, newItem.size, data.stockChecks[0].available);
      }

      const trackAddToCart = () => {
        if (typeof window !== "undefined" && window.fbq) {
          const value = (newItem.discount_percentage
            ? newItem.price * (1 - newItem.discount_percentage / 100)
            : newItem.price) * newItem.quantity;
          window.fbq("track", "AddToCart", {
            content_name: newItem.name,
            content_ids: [String(newItem.id)],
            content_type: "product",
            value,
            currency: "UAH",
          });
        }
      };

      // Use functional update to ensure we work with latest state
      setItems((prevItems) => {
        const existingIndex = prevItems.findIndex(
          (i) =>
            i.id === newItem.id &&
            i.size === newItem.size &&
            i.color === newItem.color
        );
        if (existingIndex !== -1) {
          const updated = [...prevItems];
          updated[existingIndex].quantity += newItem.quantity;
          trackAddToCart();
          return updated;
        }
        trackAddToCart();
        return [...prevItems, newItem];
      });
    } catch (error) {
      // Re-throw error so components can handle it
      throw error;
    } finally {
      pendingChecksRef.current.delete(cacheKey);
    }
  }

  // Background stock check (non-blocking)
  async function checkStockInBackground(
    productId: number,
    size: string,
    quantity: number
  ): Promise<void> {
    try {
      const response = await fetch("/api/products/check-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ product_id: productId, size, quantity }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.stockChecks?.[0]) {
          setCachedStock(productId, size, data.stockChecks[0].available);
        }
      }
    } catch (error) {
      // Silently fail - this is just a background update
      console.warn("Background stock check failed:", error);
    }
  }

  function removeItem(id: number, size: string) {
    setItems((prev) =>
      prev.filter((item) => item.id !== id || item.size !== size)
    );
  }

  async function updateQuantity(id: number, size: string, quantity: number): Promise<void> {
    if (quantity < 1) {
      return;
    }

    // Check cache first
    const cachedStock = getCachedStock(id, size);
    const cacheKey = getStockCacheKey(id, size);
    
    // If we have cached stock and it's sufficient, skip API call
    if (cachedStock !== null && cachedStock >= quantity) {
      // Optimistic update
      setItems((prev) => {
        return prev.map((item) => {
          if (item.id === id && item.size === size) {
            return { ...item, quantity: Math.max(quantity, 1) };
          }
          return item;
        });
      });
      
      // Verify in background
      checkStockInBackground(id, size, quantity);
      return;
    }

    // Prevent duplicate checks
    if (pendingChecksRef.current.has(cacheKey)) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return updateQuantity(id, size, quantity);
    }

    pendingChecksRef.current.add(cacheKey);

    try {
      const response = await fetch("/api/products/check-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              product_id: id,
              size: size,
              quantity: quantity,
            },
          ],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        const available = data.insufficientItems?.[0]?.available ?? 0;
        setCachedStock(id, size, available);
        throw new Error(
          available > 0
            ? `Недостатньо товару в наявності. Доступно: ${available} шт.`
            : "Недостатньо товару в наявності"
        );
      }

      const data = await response.json();
      // Cache the successful check result
      if (data.stockChecks?.[0]) {
        setCachedStock(id, size, data.stockChecks[0].available);
      }

      setItems((prev) => {
        return prev.map((item) => {
          if (item.id === id && item.size === size) {
            return { ...item, quantity: Math.max(quantity, 1) };
          }
          return item;
        });
      });
    } catch (error) {
      // Re-throw error so components can handle it
      throw error;
    } finally {
      pendingChecksRef.current.delete(cacheKey);
    }
  }

  function clearBasket() {
    setItems([]);
  }

  return (
    <BasketContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearBasket }}
    >
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  const context = useContext(BasketContext);
  if (!context) {
    throw new Error("useBasket must be used within a BasketProvider");
  }
  return context;
}
