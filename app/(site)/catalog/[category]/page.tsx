import { Suspense } from "react";
import CatalogServer from "@/components/catalog/CatalogServer";
import type { Metadata } from "next";
import { CatalogGridSkeleton } from "@/components/shared/SkeletonLoader";
import { sqlGetAllCategories } from "@/lib/sql";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

export const revalidate = 1200; // ISR every 20 minutes

// Generate static pages for all categories at build time
export async function generateStaticParams() {
  try {
    const categories = await sqlGetAllCategories();
    return categories.map(cat => ({ 
      category: encodeURIComponent(cat.name)
    }));
  } catch (error) {
    console.error('Error generating static params for categories:', error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const baseUrl = process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";
  
  const title = `${decodedCategory} | Каталог | 13VPLUS`;
  const description = `Каталог товарів категорії "${decodedCategory}" від 13VPLUS. Якісний жіночий одяг з індивідуальним пошивом.`;
  const ogImage = `${baseUrl}/images/13VPLUS BLACK PNG 2.png`;
  const catalogUrl = `${baseUrl}/catalog/${category}`;
  
  return {
    title,
    description,
    keywords: `${decodedCategory}, жіночий одяг, 13VPLUS, каталог, український бренд, мінімалізм, лакшері стиль`,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "uk_UA",
      url: catalogUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "13VPLUS - Каталог товарів",
        },
      ],
      siteName: "13VPLUS",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: catalogUrl,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  
  // Verify category exists
  const categories = await sqlGetAllCategories();
  const categoryExists = categories.some(cat => cat.name === decodedCategory);
  
  if (!categoryExists) {
    notFound();
  }
  
  return (
    <Suspense fallback={
      <section className="max-w-[1824px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-10 mb-20">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-['Montserrat'] uppercase tracking-wider text-gray-900">
            Завантаження...
          </h1>
        </div>
        <CatalogGridSkeleton count={12} />
      </section>
    }>
      <CatalogServer 
        category={decodedCategory}
        season={null}
        subcategory={null}
      />
    </Suspense>
  );
}
