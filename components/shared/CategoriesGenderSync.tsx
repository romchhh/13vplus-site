"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCategories } from "@/lib/CategoriesProvider";
import { parseProductGender } from "@/lib/productGender";

const STORAGE_KEY = "catalog_gender";

/** Синхронізує gender з URL у CategoriesProvider */
export default function CategoriesGenderSync() {
  const searchParams = useSearchParams();
  const { setCatalogGender } = useCategories();

  useEffect(() => {
    const fromUrl = parseProductGender(searchParams.get("gender"));
    if (fromUrl) {
      setCatalogGender(fromUrl);
      return;
    }

    const stored = parseProductGender(sessionStorage.getItem(STORAGE_KEY));
    if (stored) {
      setCatalogGender(stored, { silent: true });
    }
  }, [searchParams, setCatalogGender]);

  return null;
}
