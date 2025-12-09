import ProductServer from "@/components/product/ProductServer";
import YouMightLike from "@/components/product/YouMightLike";
import { Suspense } from "react";
import type { Metadata } from "next";
import { sqlGetProduct } from "@/lib/sql";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export const revalidate = 300; // ISR every 5 minutes

// Generate static params for popular products
export async function generateStaticParams() {
  try {
    const { sqlGetAllProducts } = await import("@/lib/sql");
    const products = await sqlGetAllProducts();
    
    // Generate static pages for all products (or limit to top N)
    return products.slice(0, 50).map((product: { id: number }) => ({
      id: String(product.id),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await sqlGetProduct(Number(id));

  if (!product) {
    return {
      title: "Товар не знайдено | 13VPLUS",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const firstMedia = product.media && product.media.length > 0 ? product.media[0] : null;
  const imageUrl = firstMedia
    ? `${baseUrl}/api/images/${firstMedia.url}`
    : `${baseUrl}/images/13VPLUS BLACK PNG 2.png`;
  
  const price = product.discount_percentage
    ? (product.price * (1 - product.discount_percentage / 100)).toFixed(0)
    : product.price.toFixed(0);

  return {
    title: `${product.name} | 13VPLUS`,
    description: product.description || `${product.name} від 13VPLUS. Ціна: ${price} ₴. Індивідуальний пошив під ваші параметри.`,
    keywords: `${product.name}, 13VPLUS, жіночий одяг, ${product.category_name || ""}, український бренд`,
    openGraph: {
      title: `${product.name} | 13VPLUS`,
      description: product.description || `${product.name} від 13VPLUS. Ціна: ${price} ₴.`,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      locale: "uk_UA",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | 13VPLUS`,
      description: product.description || `${product.name} від 13VPLUS`,
      images: [imageUrl],
    },
    alternates: {
      canonical: `${baseUrl}/product/${id}`,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  
  return (
    <main>
      <Suspense fallback={<div className="text-center py-20 text-lg">Завантаження товару...</div>}>
        <ProductServer id={id} />
      </Suspense>
      <YouMightLike />
    </main>
  );
}
