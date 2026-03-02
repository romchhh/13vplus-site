import CatalogClient from "./CatalogClient";
import { 
  sqlGetAllProducts, 
  sqlGetProductsByCategory, 
  sqlGetProductsBySubcategoryName,
  sqlGetAllCategories
} from "@/lib/sql";
import { CollectionPageStructuredData, BreadcrumbStructuredData } from "@/components/shared/StructuredData";

interface Product {
  id: number;
  name: string;
  slug?: string | null;
  price: number;
  description?: string | null;
  first_media?: { url: string; type: string } | null;
  discount_percentage?: number | null;
  category_id?: number | null;
}

interface CatalogServerProps {
  category?: string | null;
  subcategory?: string | null;
}

async function getProducts(params: CatalogServerProps): Promise<Product[]> {
  const { category, subcategory } = params;
  
  try {
    if (subcategory) {
      return await sqlGetProductsBySubcategoryName(subcategory);
    } else if (category) {
      return await sqlGetProductsByCategory(category);
    }
    return await sqlGetAllProducts();
  } catch (error) {
    console.error("Error fetching products:", error);
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
  const [products, categories] = await Promise.all([
    getProducts(props),
    getCategories(),
  ]);

  const baseUrl = process.env.PUBLIC_URL || 'http://localhost:3000';
  const categoryName = props.category || props.subcategory || null;
  const catalogUrl = `${baseUrl}/catalog${categoryName ? `?category=${encodeURIComponent(categoryName)}` : ""}`;
  const pageName = categoryName || "Каталог товарів";
  const pageDescription = categoryName
    ? `Каталог товарів категорії "${categoryName}" від Choice. Якісний жіночий одяг з індивідуальним пошивом.`
    : "Перегляньте весь каталог жіночого одягу від Choice. Повсякденний одяг, домашній одяг та купальники в мінімалістичному лакшері стилі.";

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
      <CatalogClient initialProducts={products} categories={categories} />
    </>
  );
}

