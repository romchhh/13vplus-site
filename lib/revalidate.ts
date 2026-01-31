import { revalidateTag } from 'next/cache';

/**
 * Server action to revalidate product cache
 * Call this after creating/updating/deleting products
 */
export async function revalidateProducts() {
  'use server';
  revalidateTag('products');
}

/**
 * Server action to revalidate category cache
 * Call this after creating/updating/deleting categories
 */
export async function revalidateCategories() {
  'use server';
  revalidateTag('categories');
}

/**
 * Server action to revalidate all caches
 */
export async function revalidateAll() {
  'use server';
  revalidateTag('products');
  revalidateTag('categories');
}
