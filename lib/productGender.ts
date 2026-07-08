export const PRODUCT_GENDERS = ["women", "men"] as const;
export type ProductGender = (typeof PRODUCT_GENDERS)[number];

export const DEFAULT_PRODUCT_GENDER: ProductGender = "women";

export const PRODUCT_GENDER_LABELS: Record<ProductGender, string> = {
  women: "Для жінок",
  men: "Для чоловіків",
};

export const PRODUCT_GENDER_SHORT_LABELS: Record<ProductGender, string> = {
  women: "Жінкам",
  men: "Чоловікам",
};

export function parseProductGender(value: string | null | undefined): ProductGender | null {
  if (value === "women" || value === "men") return value;
  return null;
}

export function catalogGenderQuery(gender: ProductGender): string {
  return `gender=${gender}`;
}

export function buildCatalogUrl(options?: {
  gender?: ProductGender | null;
  category?: string | null;
  subcategory?: string | null;
  season?: string | null;
}): string {
  const params = new URLSearchParams();
  if (options?.gender) params.set("gender", options.gender);
  if (options?.subcategory?.trim()) params.set("subcategory", options.subcategory.trim());
  else if (options?.category?.trim()) params.set("category", options.category.trim());
  else if (options?.season?.trim()) params.set("season", options.season.trim());
  const query = params.toString();
  return query ? `/catalog?${query}` : "/catalog";
}
