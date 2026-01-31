import { Suspense } from "react";
import CatalogServer from "@/components/catalog/CatalogServer";
import type { Metadata } from "next";
import { CatalogGridSkeleton } from "@/components/shared/SkeletonLoader";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    season?: string;
    subcategory?: string;
  }>;
}

export const revalidate = 1200; // ISR every 20 minutes
export const dynamic = 'force-static'; // Generate static pages at build time

// Generate static pages for popular categories
export async function generateStaticParams() {
  const popularCategories = [
    { category: 'Повсякденний одяг' },
    { category: 'Домашній одяг' },
    { category: 'Купальники' },
    { category: 'Аксесуари' },
    // Add more popular categories
  ];

  return [
    {}, // Main catalog page without params
    ...popularCategories.map(cat => ({ 
      searchParams: cat 
    })),
  ];
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const baseUrl = process.env.PUBLIC_URL;
  
  let title = "Каталог товарів | 13VPLUS";
  let description = "Перегляньте весь каталог жіночого одягу від 13VPLUS. Повсякденний одяг, домашній одяг та купальники в мінімалістичному лакшері стилі.";
  
  if (params.category) {
    title = `${params.category} | Каталог | 13VPLUS`;
    description = `Каталог товарів категорії "${params.category}" від 13VPLUS. Якісний жіночий одяг з індивідуальним пошивом.`;
  } else if (params.subcategory) {
    title = `${params.subcategory} | Каталог | 13VPLUS`;
    description = `Каталог товарів підкатегорії "${params.subcategory}" від 13VPLUS.`;
  }

  const ogImage = `${baseUrl}/images/13VPLUS BLACK PNG 2.png`;
  const catalogUrl = `${baseUrl}/catalog${params.category ? `?category=${encodeURIComponent(params.category)}` : ""}`;
  
  return {
    title,
    description,
    keywords: params.category 
      ? `${params.category}, жіночий одяг, 13VPLUS, каталог, український бренд, мінімалізм, лакшері стиль`
      : "13VPLUS, каталог товарів, жіночий одяг, повсякденний одяг, домашній одяг, купальники, український бренд",
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

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams;
    
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
                category={params.category || null}
                season={params.season || null}
                subcategory={params.subcategory || null}
            />
        </Suspense>
    );
}