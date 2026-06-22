"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { clearCache, clearCacheByPrefix, CACHE_KEYS } from "@/lib/cache";

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
  fetchSubcategoriesForCategory: (categoryId: number, force?: boolean) => Promise<Subcategory[]>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

async function fetchFresh<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Map<number, Subcategory[]>>(new Map());
  const subcategoriesRef = useRef(subcategories);
  subcategoriesRef.current = subcategories;

  const fetchSubcategoriesForCategory = useCallback(
    async (categoryId: number, force = false): Promise<Subcategory[]> => {
      if (!force && subcategoriesRef.current.has(categoryId)) {
        return subcategoriesRef.current.get(categoryId) || [];
      }

      try {
        const subData = await fetchFresh<Subcategory[]>(
          `/api/subcategories?parent_category_id=${categoryId}`
        );

        setSubcategories((prev) => new Map(prev).set(categoryId, subData));
        return subData;
      } catch (err) {
        console.error(`Failed to fetch subcategories for category ${categoryId}:`, err);
        const emptyArray: Subcategory[] = [];
        setSubcategories((prev) => new Map(prev).set(categoryId, emptyArray));
        return emptyArray;
      }
    },
    []
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;

    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      clearCache(CACHE_KEYS.CATEGORIES);
      clearCacheByPrefix("cache_subcategories_");
      setSubcategories(new Map());

      const categoriesData = await fetchFresh<Category[]>("/api/categories");
      setCategories(categoriesData);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch categories");
      setCategories([]);
      setSubcategories(new Map());
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Refetch when user returns to the tab (e.g. after editing in admin)
  useEffect(() => {
    const onFocus = () => {
      void fetchData({ silent: true });
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchData]);

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
