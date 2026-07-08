"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { clearCache, clearCacheByPrefix, CACHE_KEYS } from "@/lib/cache";
import {
  DEFAULT_PRODUCT_GENDER,
  type ProductGender,
} from "@/lib/productGender";

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
  catalogGender: ProductGender;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setCatalogGender: (gender: ProductGender, options?: { silent?: boolean }) => void;
  fetchSubcategoriesForCategory: (categoryId: number, force?: boolean) => Promise<Subcategory[]>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

const STORAGE_KEY = "catalog_gender";

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
  const [catalogGender, setCatalogGenderState] = useState<ProductGender>(DEFAULT_PRODUCT_GENDER);
  const catalogGenderRef = useRef(catalogGender);
  catalogGenderRef.current = catalogGender;

  const subcategoriesRef = useRef(subcategories);
  subcategoriesRef.current = subcategories;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (options?: { silent?: boolean; gender?: ProductGender }) => {
    const silent = options?.silent ?? false;
    const activeGender = options?.gender ?? catalogGenderRef.current;

    try {
      if (!silent) setLoading(true);
      setError(null);

      clearCache(CACHE_KEYS.CATEGORIES);
      clearCacheByPrefix("cache_subcategories_");
      setSubcategories(new Map());

      const categoriesData = await fetchFresh<Category[]>(
        `/api/categories?gender=${activeGender}`
      );
      setCategories(categoriesData);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch categories");
      setCategories([]);
      setSubcategories(new Map());
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const setCatalogGender = useCallback(
    (gender: ProductGender, options?: { silent?: boolean }) => {
      setCatalogGenderState(gender);
      catalogGenderRef.current = gender;
      if (typeof window !== "undefined") {
        sessionStorage.setItem(STORAGE_KEY, gender);
      }
      void fetchData({ silent: options?.silent, gender });
    },
    [fetchData]
  );

  const fetchSubcategoriesForCategory = useCallback(
    async (categoryId: number, force = false): Promise<Subcategory[]> => {
      if (!force && subcategoriesRef.current.has(categoryId)) {
        return subcategoriesRef.current.get(categoryId) || [];
      }

      try {
        const gender = catalogGenderRef.current;
        const subData = await fetchFresh<Subcategory[]>(
          `/api/subcategories?parent_category_id=${categoryId}&gender=${gender}`
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

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? (sessionStorage.getItem(STORAGE_KEY) as ProductGender | null)
        : null;
    const initialGender =
      stored === "women" || stored === "men" ? stored : DEFAULT_PRODUCT_GENDER;
    setCatalogGenderState(initialGender);
    catalogGenderRef.current = initialGender;
    void fetchData({ gender: initialGender });
  }, [fetchData]);

  useEffect(() => {
    const onFocus = () => {
      void fetchData({ silent: true, gender: catalogGenderRef.current });
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchData]);

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        subcategories,
        catalogGender,
        loading,
        error,
        refetch: () => fetchData({ gender: catalogGenderRef.current }),
        setCatalogGender,
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
