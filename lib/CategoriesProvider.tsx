"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { cachedFetch, CACHE_KEYS } from "@/lib/cache";

interface Category {
  id: number;
  name: string;
  priority: number;
  mediaType?: string | null;
  mediaUrl?: string | null;
}

interface Subcategory {
  id: number;
  name: string;
  parent_category_id: number;
}

interface CategoriesContextType {
  categories: Category[];
  subcategories: Map<number, Subcategory[]>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  fetchSubcategoriesForCategory: (categoryId: number) => Promise<Subcategory[]>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Map<number, Subcategory[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch subcategories on demand (lazy loading)
  const fetchSubcategoriesForCategory = async (categoryId: number): Promise<Subcategory[]> => {
    // Check if already loaded
    if (subcategories.has(categoryId)) {
      return subcategories.get(categoryId) || [];
    }

    try {
      const subData = await cachedFetch<Subcategory[]>(
        `/api/subcategories?parent_category_id=${categoryId}`,
        `cache_subcategories_${categoryId}`,
        5 * 60 * 1000 // 5 minutes
      );
      
      // Update the map
      setSubcategories(prev => new Map(prev).set(categoryId, subData));
      return subData;
    } catch (err) {
      console.error(`Failed to fetch subcategories for category ${categoryId}:`, err);
      const emptyArray: Subcategory[] = [];
      setSubcategories(prev => new Map(prev).set(categoryId, emptyArray));
      return emptyArray;
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Only fetch categories initially (not subcategories!)
      const categoriesData = await cachedFetch<Category[]>(
        "/api/categories",
        CACHE_KEYS.CATEGORIES,
        5 * 60 * 1000 // 5 minutes
      );

      setCategories(categoriesData);
      
      // Don't fetch all subcategories - load on demand instead!
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch categories");
      setCategories([]);
      setSubcategories(new Map());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        subcategories,
        loading,
        error,
        refetch: fetchData,
        fetchSubcategoriesForCategory,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error("useCategories must be used within CategoriesProvider");
  }
  return context;
}
