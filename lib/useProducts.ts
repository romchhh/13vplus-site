/**
 * Custom hook for fetching and caching products
 */

import { useState, useEffect } from "react";
import { cachedFetch, CACHE_KEYS } from "./cache";

interface Product {
  id: number;
  name: string;
  price: number;
  discount_percentage?: number;
  media?: { url: string; type: string }[];
  first_media?: { url: string; type: string } | null;
  sizes?: { size: string; stock: string }[];
  color?: string;
  colors?: { label: string; hex?: string | null }[];
  top_sale?: boolean;
  limited_edition?: boolean;
  season?: string;
  category_name?: string;
  description?: string;
  has_lining?: boolean;
  lining_description?: string;
  fabric_composition?: string;
}

interface UseProductsOptions {
  category?: string | null;
  season?: string | null;
  subcategory?: string | null;
  topSale?: boolean;
  limitedEdition?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { category, season, subcategory, topSale, limitedEdition } = options;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);

        let url = "/api/products";
        let cacheKey = CACHE_KEYS.PRODUCTS;

        if (topSale) {
          url = "/api/products/top-sale";
          cacheKey = "products_top_sale";
        } else if (limitedEdition) {
          url = "/api/products/limited-edition";
          cacheKey = "products_limited_edition";
        } else if (subcategory) {
          url = `/api/products/subcategory?subcategory=${encodeURIComponent(
            subcategory
          )}`;
          cacheKey = CACHE_KEYS.PRODUCTS_SUBCATEGORY(subcategory);
        } else if (category) {
          url = `/api/products/category?category=${encodeURIComponent(category)}`;
          cacheKey = CACHE_KEYS.PRODUCTS_CATEGORY(category);
        } else if (season) {
          url = `/api/products/season?season=${encodeURIComponent(season)}`;
          cacheKey = CACHE_KEYS.PRODUCTS_SEASON(season);
        }

        // Use shorter cache duration for limited edition (1 minute instead of 5)
        const cacheDuration = limitedEdition ? 60 * 1000 : undefined;
        
        // For limited edition, add timestamp to bypass cache if needed
        const urlWithCache = limitedEdition ? `${url}?t=${Date.now()}` : url;
        
        const data = await cachedFetch<Product[]>(urlWithCache, cacheKey, cacheDuration);
        console.log(`[useProducts] Fetched ${data.length} limited edition products:`, data.map(p => ({ id: p.id, name: p.name, hasMedia: !!p.first_media })));
        setProducts(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [category, season, subcategory, topSale, limitedEdition]);

  return { products, loading, error };
}

export function useProduct(id: number | string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);

        const data = await cachedFetch<Product>(
          `/api/products/${id}`,
          CACHE_KEYS.PRODUCT(Number(id))
        );
        setProduct(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchProduct();
  }, [id]);

  return { product, loading, error };
}

