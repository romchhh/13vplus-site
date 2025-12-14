import CatalogClient from "./CatalogClient";
import { 
  sqlGetAllProducts, 
  sqlGetProductsByCategory, 
  sqlGetProductsBySeason, 
  sqlGetProductsBySubcategoryName,
  sqlGetAllColors,
  sqlGetAllCategories
} from "@/lib/sql";
import { CollectionPageStructuredData, BreadcrumbStructuredData } from "@/components/shared/StructuredData";
import Breadcrumbs from "@/components/shared/Breadcrumbs";

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
  const categoryName = props.category || props.subcategory || null;
  const catalogUrl = `${baseUrl}/catalog${categoryName ? `?category=${encodeURIComponent(categoryName)}` : ""}`;
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
      <div className="max-w-[1824px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumbs items={breadcrumbs} />
      </div>
      <CatalogClient initialProducts={products} colors={colors} categories={categories} />
    </>
  );
}

