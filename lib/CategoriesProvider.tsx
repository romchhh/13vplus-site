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
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Map<number, Subcategory[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch categories with caching
      const categoriesData = await cachedFetch<Category[]>(
        "/api/categories",
        CACHE_KEYS.CATEGORIES,
        5 * 60 * 1000 // 5 minutes
      );

      setCategories(categoriesData);

      // Fetch subcategories for all categories in parallel
      const subcategoriesMap = new Map<number, Subcategory[]>();
      
      await Promise.all(
        categoriesData.map(async (cat) => {
          try {
            const subData = await cachedFetch<Subcategory[]>(
              `/api/subcategories?parent_category_id=${cat.id}`,
              `cache_subcategories_${cat.id}`,
              5 * 60 * 1000 // 5 minutes
            );
            subcategoriesMap.set(cat.id, subData);
          } catch (err) {
            console.error(`Failed to fetch subcategories for category ${cat.id}:`, err);
            subcategoriesMap.set(cat.id, []);
          }
        })
      );

      setSubcategories(subcategoriesMap);
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
