import { Suspense } from "react";
import CatalogServer from "@/components/catalog/CatalogServer";
import type { Metadata } from "next";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    season?: string;
    subcategory?: string;
  }>;
}

export const revalidate = 300; // ISR every 5 minutes

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  let title = "Каталог товарів | 13VPLUS";
  let description = "Перегляньте весь каталог жіночого одягу від 13VPLUS. Повсякденний одяг, домашній одяг та купальники в мінімалістичному лакшері стилі.";
  
  if (params.category) {
    title = `${params.category} | Каталог | 13VPLUS`;
    description = `Каталог товарів категорії "${params.category}" від 13VPLUS. Якісний жіночий одяг з індивідуальним пошивом.`;
  } else if (params.subcategory) {
    title = `${params.subcategory} | Каталог | 13VPLUS`;
    description = `Каталог товарів підкатегорії "${params.subcategory}" від 13VPLUS.`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "uk_UA",
      url: `${baseUrl}/catalog${params.category ? `?category=${encodeURIComponent(params.category)}` : ""}`,
    },
    alternates: {
      canonical: `${baseUrl}/catalog${params.category ? `?category=${encodeURIComponent(params.category)}` : ""}`,
    },
  };
}

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams;
    
    return (
        <Suspense fallback={<div className="text-center py-20 text-lg">Завантаження каталогу...</div>}>
            <CatalogServer 
                category={params.category || null}
                season={params.season || null}
                subcategory={params.subcategory || null}
            />
        </Suspense>
    );
}