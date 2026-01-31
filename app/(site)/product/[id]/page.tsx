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

// Generate static params for most important products at build time
export async function generateStaticParams() {
  try {
    const { prisma } = await import("@/lib/prisma");
    
    // Get top products: limited edition, top sale, and recent (total ~50-100)
    const [limitedEdition, topSale, recent] = await Promise.all([
      prisma.product.findMany({
        where: { limitedEdition: true },
        select: { id: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.product.findMany({
        where: { topSale: true },
        select: { id: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.product.findMany({
        select: { id: true },
        orderBy: { createdAt: "desc" },
        take: 30, // Most recent products
      }),
    ]);
    
    // Combine and deduplicate IDs
    const allIds = new Set([
      ...limitedEdition.map(p => p.id),
      ...topSale.map(p => p.id),
      ...recent.map(p => p.id),
    ]);
    
    return Array.from(allIds).map(id => ({
      id: String(id),
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

  const baseUrl = process.env.PUBLIC_URL;
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
