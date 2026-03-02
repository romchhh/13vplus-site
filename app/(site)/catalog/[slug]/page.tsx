import { Suspense } from "react";
import CatalogServer from "@/components/catalog/CatalogServer";
import type { Metadata } from "next";
import { CatalogGridSkeleton } from "@/components/shared/SkeletonLoader";
import { sqlGetAllCategories, sqlGetCategoryBySlug } from "@/lib/sql";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 1200;

export async function generateStaticParams() {
  try {
    const categories = await sqlGetAllCategories();
    return categories
      .filter((c) => c.slug != null)
      .map((c) => ({ slug: c.slug! }));
  } catch (error) {
    console.error("Error generating static params for categories:", error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await sqlGetCategoryBySlug(slug);
  if (!category) return { title: "Категорія не знайдена | Choice" };

  const baseUrl = process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";
  const title = `${category.name} | Каталог | Choice`;
  const description = `Каталог товарів категорії "${category.name}" від Choice. Якісний жіночий одяг з індивідуальним пошивом.`;
  const catalogUrl = `${baseUrl}/catalog/${slug}`;

  return {
    title,
    description,
    keywords: `${category.name}, жіночий одяг, Choice, каталог, український бренд, мінімалізм, лакшері стиль`,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "uk_UA",
      url: catalogUrl,
      images: [{ url: `${baseUrl}/images/tg_image_3614117882.png`, width: 1200, height: 630, alt: "Choice - Каталог" }],
      siteName: "Choice",
    },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: catalogUrl },
  };
}

export default async function CatalogSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await sqlGetCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <Suspense
      fallback={
        <section className="max-w-[1824px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-10 mb-20">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-['Montserrat'] uppercase tracking-wider text-gray-900">
              Завантаження...
            </h1>
          </div>
          <CatalogGridSkeleton count={12} />
        </section>
      }
    >
      <CatalogServer category={category.name} subcategory={null} />
    </Suspense>
  );
}
