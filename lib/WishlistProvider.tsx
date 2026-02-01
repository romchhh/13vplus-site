"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface WishlistContextType {
  wishlist: number[];
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (productId: number) => void;
  setWishlist: (productIds: number[]) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "wishlistItems";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<number[]>([]);

  // Load from localStorage only on client side after hydration
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setWishlist(JSON.parse(saved));
      }
    } catch {
      // Handle localStorage read errors
    }
  }, []);

  // Save wishlist items to localStorage whenever wishlist changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // Handle localStorage write errors if needed
    }
  }, [wishlist]);

  function isInWishlist(productId: number): boolean {
    return wishlist.includes(productId);
  }

  function toggleWishlist(productId: number) {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  }

  function setWishlistIds(productIds: number[]) {
    setWishlist(productIds);
  }

  return (
    <WishlistContext.Provider value={{ wishlist, isInWishlist, toggleWishlist, setWishlist: setWishlistIds }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}

