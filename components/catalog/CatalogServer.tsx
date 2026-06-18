import CatalogClient from "./CatalogClient";
import { subcategoryLeafName } from "@/lib/subcategory";
import { 
  sqlGetAllProducts, 
  sqlGetProductsByCategory, 
  sqlGetProductsBySeason, 
  sqlGetProductsBySubcategoryName,
  sqlGetAllColors,
  sqlGetAllCategories
} from "@/lib/sql";
import { CollectionPageStructuredData, BreadcrumbStructuredData } from "@/components/shared/StructuredData";

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

  const baseUrl = process.env.PUBLIC_URL || 'http://localhost:3000';
  const categoryName = props.category || (props.subcategory ? subcategoryLeafName(props.subcategory) : null);
  const catalogQuery = props.subcategory
    ? `subcategory=${encodeURIComponent(props.subcategory)}`
    : props.category
      ? `category=${encodeURIComponent(props.category)}`
      : props.season
        ? `season=${encodeURIComponent(props.season)}`
        : "";
  const catalogUrl = `${baseUrl}/catalog${catalogQuery ? `?${catalogQuery}` : ""}`;
  const pageName = categoryName || "Каталог товарів";
  const pageDescription = categoryName
    ? `Каталог товарів категорії "${categoryName}" від 13VPLUS. Якісний жіночий одяг з індивідуальним пошивом.`
    : "Перегляньте весь каталог жіночого одягу від 13VPLUS. Повсякденний одяг, домашній одяг та купальники в мінімалістичному лакшері стилі.";

  const breadcrumbs = [
    { name: "Головна", url: baseUrl },
    { name: "Каталог", url: `${baseUrl}/catalog` },
    ...(categoryName ? [{ name: categoryName, url: catalogUrl }] : []),
  ];

  return (
    <>
      <CollectionPageStructuredData
        name={pageName}
        description={pageDescription}
        url={catalogUrl}
        baseUrl={baseUrl}
        itemCount={products.length}
        category={categoryName || undefined}
      />
      <BreadcrumbStructuredData items={breadcrumbs} />
      <CatalogClient initialProducts={products} colors={colors} categories={categories} />
    </>
  );
}

