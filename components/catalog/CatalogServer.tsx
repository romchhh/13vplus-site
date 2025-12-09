import CatalogClient from "./CatalogClient";
import { 
  sqlGetAllProducts, 
  sqlGetProductsByCategory, 
  sqlGetProductsBySeason, 
  sqlGetProductsBySubcategoryName,
  sqlGetAllColors,
  sqlGetAllCategories
} from "@/lib/sql";

interface Product {
  id: number;
  name: string;
  price: number;
  first_media?: { url: string; type: string } | null;
  sizes?: { size: string; stock: string }[];
  color?: string;
}

interface CatalogServerProps {
  category?: string | null;
  season?: string | null;
  subcategory?: string | null;
}

async function getProducts(params: CatalogServerProps): Promise<Product[]> {
  const { category, season, subcategory } = params;
  
  try {
    if (subcategory) {
      return await sqlGetProductsBySubcategoryName(subcategory);
    } else if (category) {
      return await sqlGetProductsByCategory(category);
    } else if (season) {
      return await sqlGetProductsBySeason(season);
    }
    return await sqlGetAllProducts();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

async function getColors(): Promise<{ color: string; hex?: string }[]> {
  try {
    const data = await sqlGetAllColors();
    return data;
  } catch (error) {
    console.error("Error fetching colors:", error);
    return [];
  }
}

async function getCategories(): Promise<{ id: number; name: string }[]> {
  try {
    const data = await sqlGetAllCategories();
    return data.map((c) => ({ id: c.id, name: c.name }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function CatalogServer(props: CatalogServerProps) {
  // Parallel data fetching for better performance
  const [products, colors, categories] = await Promise.all([
    getProducts(props),
    getColors(),
    getCategories(),
  ]);

  return <CatalogClient initialProducts={products} colors={colors} categories={categories} />;
}

