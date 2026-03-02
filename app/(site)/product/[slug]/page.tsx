import ProductServer from "@/components/product/ProductServer";
import YouMightLike from "@/components/product/YouMightLike";
import { Suspense } from "react";
import type { Metadata } from "next";
import { sqlGetProductBySlug, sqlGetProduct, sqlGetAllProducts } from "@/lib/sql";
import { redirect, notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 1200; // ISR every 20 minutes

export async function generateStaticParams() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const products = await prisma.product.findMany({
      where: { slug: { not: null } },
      select: { slug: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return products
      .filter((p: { slug: string | null }): p is { slug: string } => p.slug != null)
      .map((p: { slug: string }) => ({ slug: p.slug }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let product = await sqlGetProductBySlug(slug);
  if (!product && /^\d+$/.test(slug)) {
    product = await sqlGetProduct(Number(slug));
  }
  if (!product) {
    return { title: "Товар не знайдено | Choice" };
  }

  const baseUrl = process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";
  const canonicalSlug = product.slug || String(product.id);
  const firstMedia = product.media?.length ? product.media[0] : null;
  const imageUrl = firstMedia
    ? `${baseUrl}/api/images/${firstMedia.url}`
    : `${baseUrl}/images/tg_image_3614117882.png`;
  const price = product.discount_percentage
    ? (product.price * (1 - product.discount_percentage / 100)).toFixed(0)
    : product.price.toFixed(0);

  return {
    title: `${product.name} | Choice`,
    description: product.description || `${product.name} від Choice. Ціна: ${price} ₴. Індивідуальний пошив під ваші параметри.`,
    keywords: `${product.name}, Choice, жіночий одяг, ${product.category_name || ""}, український бренд`,
    openGraph: {
      title: `${product.name} | Choice`,
      description: product.description || `${product.name} від Choice. Ціна: ${price} ₴.`,
      type: "website",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: product.name }],
      locale: "uk_UA",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Choice`,
      description: product.description || `${product.name} від Choice`,
      images: [imageUrl],
    },
    alternates: { canonical: `${baseUrl}/product/${canonicalSlug}` },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const slugStr = typeof slug === "string" ? slug.trim() : "";
  if (!slugStr) notFound();

  let product = await sqlGetProductBySlug(slugStr);
  if (!product && /^\d+$/.test(slugStr)) {
    product = await sqlGetProduct(Number(slugStr));
    if (product?.slug) {
      redirect(`/product/${product.slug}`);
    }
  }
  if (!product) {
    notFound();
  }

  // Схожі товари — з сервера, без клієнтського запиту
  const allProducts = await sqlGetAllProducts();
  const suggestedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug ?? null,
      price: p.price,
      first_media: p.first_media ?? null,
    }));

  return (
    <main className="min-h-screen bg-[#FFFFFF]">
      <Suspense fallback={<div className="text-center py-20 text-lg">Завантаження товару...</div>}>
        <ProductServer product={product} />
      </Suspense>
      <YouMightLike suggestedProducts={suggestedProducts} />
    </main>
  );
}
