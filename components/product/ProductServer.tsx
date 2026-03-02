import ProductClientWrapper from "./ProductClientWrapper";
import { ProductStructuredData, BreadcrumbStructuredData } from "@/components/shared/StructuredData";
import type { Product } from "@/lib/types/product";

interface ProductServerProps {
  product: Product;
}

export default async function ProductServer({ product }: ProductServerProps) {

  const baseUrl = process.env.PUBLIC_URL || "http://localhost:3000";
  const productSlug = product.slug || String(product.id);
  const categorySlug = product.category_slug ?? (product.category_name ? encodeURIComponent(product.category_name) : null);
  const breadcrumbs = [
    { name: "Головна", url: baseUrl },
    { name: "Каталог", url: `${baseUrl}/catalog` },
    ...(product.category_name
      ? [{ name: product.category_name, url: `${baseUrl}/catalog/${categorySlug || encodeURIComponent(product.category_name)}` }]
      : []),
    { name: product.name, url: `${baseUrl}/product/${productSlug}` },
  ];

  const productForStructuredData = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    discount_percentage: product.discount_percentage,
    first_media: product.media?.length ? product.media[0] : null,
    category_name: product.category_name,
  };

  return (
    <>
      <ProductStructuredData product={productForStructuredData} baseUrl={baseUrl} slug={productSlug} />
      <BreadcrumbStructuredData items={breadcrumbs} />
      <ProductClientWrapper product={product} />
    </>
  );
}
