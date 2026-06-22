import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Revalidate product cache after creating/updating/deleting products.
 */
export function revalidateProducts() {
  revalidateTag("products", {});
}

/**
 * Revalidate category/subcategory cache and related catalog pages.
 * Call after creating/updating/deleting categories or subcategories.
 */
export function revalidateCategories() {
  revalidateTag("categories", {});
  // Product lists include category/subcategory names in filters and URLs
  revalidateTag("products", {});
  revalidatePath("/", "layout");
  revalidatePath("/catalog", "layout");
}

/**
 * Revalidate all product and category caches.
 */
export function revalidateAll() {
  revalidateProducts();
  revalidateCategories();
}
