import { Suspense } from "react";
import CatalogServer from "@/components/catalog/CatalogServer";
import type { Metadata } from "next";
import { CatalogGridSkeleton } from "@/components/shared/SkeletonLoader";

export const revalidate = 1200; // ISR every 20 minutes

const baseUrl =
  process.env.PUBLIC_URL ||
  process.env.NEXT_PUBLIC_PUBLIC_URL ||
  "http://localhost:3000";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    season?: string;
    subcategory?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const subcategory = params.subcategory?.trim();
  const category = params.category?.trim();
  const season = params.season?.trim();

  const pageLabel = subcategory || category || (season ? `Сезон ${season}` : null);
  const title = pageLabel
    ? `${pageLabel} | Каталог | 13VPLUS`
    : "Каталог товарів | 13VPLUS";
  const description = pageLabel
    ? `Каталог товарів категорії «${pageLabel}» від 13VPLUS. Якісний жіночий одяг з індивідуальним пошивом.`
    : "Перегляньте весь каталог жіночого одягу від 13VPLUS. Повсякденний одяг, домашній одяг та купальники в мінімалістичному лакшері стилі.";

  const query = new URLSearchParams();
  if (subcategory) query.set("subcategory", subcategory);
  else if (category) query.set("category", category);
  else if (season) query.set("season", season);
  const catalogUrl = query.size
    ? `${baseUrl}/catalog?${query.toString()}`
    : `${baseUrl}/catalog`;

  return {
    title,
    description,
    keywords: pageLabel
      ? `${pageLabel}, жіночий одяг, 13VPLUS, каталог`
      : "13VPLUS, каталог товарів, жіночий одяг, повсякденний одяг, домашній одяг, купальники, український бренд",
    openGraph: {
      title,
      description,
      type: "website",
      locale: "uk_UA",
      url: catalogUrl,
      images: [
        {
          url: `${baseUrl}/images/13VPLUS BLACK PNG 2.png`,
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
      images: [`${baseUrl}/images/13VPLUS BLACK PNG 2.png`],
    },
    alternates: {
      canonical: catalogUrl,
    },
  };
}

export default async function CatalogPage({ searchParams }: PageProps) {
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
        category={params.category?.trim() ?? null}
        season={params.season?.trim() ?? null}
        subcategory={params.subcategory?.trim() ?? null}
      />
    </Suspense>
  );
}