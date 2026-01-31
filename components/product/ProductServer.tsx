import ProductClientWrapper from "./ProductClientWrapper";
import { notFound } from "next/navigation";
import { sqlGetProduct } from "@/lib/sql";
import { ProductStructuredData, BreadcrumbStructuredData } from "@/components/shared/StructuredData";

interface Product {
  id: number;
  name: string;
  price: number;
  old_price?: number | null;
  discount_percentage?: number | null;
  description?: string | null;
  media?: { url: string; type: string }[];
  sizes?: { size: string; stock: number }[];
  colors?: { label: string; hex?: string | null }[];
  fabric_composition?: string | null;
  has_lining?: boolean;
  lining_description?: string | null;
  category_name?: string | null;
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const product = await sqlGetProduct(Number(id));
    return product || null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

interface ProductServerProps {
  id: string;
}

export default async function ProductServer({ id }: ProductServerProps) {
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const baseUrl = process.env.PUBLIC_URL || 'http://localhost:3000';
  const breadcrumbs = [
    { name: "Головна", url: baseUrl },
    { name: "Каталог", url: `${baseUrl}/catalog` },
    ...(product.category_name
      ? [{ name: product.category_name, url: `${baseUrl}/catalog/${encodeURIComponent(product.category_name)}` }]
      : []),
    { name: product.name, url: `${baseUrl}/product/${id}` },
  ];

  // Prepare product data for structured data
  const productForStructuredData = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    discount_percentage: product.discount_percentage,
    first_media: product.media && product.media.length > 0 ? product.media[0] : null,
    category_name: product.category_name,
  };

  // Wrap ProductClient to ensure it only renders client-side after hydration
  return (
    <>
      <ProductStructuredData product={productForStructuredData} baseUrl={baseUrl} />
      <BreadcrumbStructuredData items={breadcrumbs} />
      <ProductClientWrapper product={product} />
    </>
  );
}
