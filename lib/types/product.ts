/**
 * Shared product type for catalog, product page, admin, and API.
 * Keeps snake_case for API/DB compatibility.
 */

export interface ProductMedia {
  url: string;
  type: string;
}

export interface Product {
  id: number;
  name: string;
  slug?: string | null;
  subtitle?: string | null;
  release_form?: string | null;
  course?: string | null;
  package_weight?: string | null;
  main_info?: string | null;
  short_description?: string | null;
  description?: string | null;
  main_action?: string | null;
  indications_for_use?: string | null;
  benefits?: string | null;
  full_composition?: string | null;
  usage_method?: string | null;
  contraindications?: string | null;
  storage_conditions?: string | null;
  price: number;
  old_price?: number | null;
  discount_percentage?: number | null;
  media?: ProductMedia[];
  stock?: number;
  in_stock?: boolean;
  fabric_composition?: string | null;
  has_lining?: boolean;
  lining_description?: string | null;
  category_name?: string | null;
  category_slug?: string | null;
  priority?: number;
  top_sale?: boolean;
  limited_edition?: boolean;
}
