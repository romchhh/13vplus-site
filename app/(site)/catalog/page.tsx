import { Suspense } from "react";
import CatalogServer from "@/components/catalog/CatalogServer";
import type { Metadata } from "next";
import { CatalogGridSkeleton } from "@/components/shared/SkeletonLoader";

export const revalidate = 1200; // ISR every 20 minutes

export const metadata: Metadata = {
  title: "Каталог товарів | 13VPLUS",
  description: "Перегляньте весь каталог жіночого одягу від 13VPLUS. Повсякденний одяг, домашній одяг та купальники в мінімалістичному лакшері стилі.",
  keywords: "13VPLUS, каталог товарів, жіночий одяг, повсякденний одяг, домашній одяг, купальники, український бренд",
  openGraph: {
    title: "Каталог товарів | 13VPLUS",
    description: "Перегляньте весь каталог жіночого одягу від 13VPLUS. Повсякденний одяг, домашній одяг та купальники в мінімалістичному лакшері стилі.",
    type: "website",
    locale: "uk_UA",
    url: `${process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000"}/catalog`,
    images: [
      {
        url: `${process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000"}/images/13VPLUS BLACK PNG 2.png`,
        width: 1200,
        height: 630,
        alt: "13VPLUS - Каталог товарів",
      },
    ],
    siteName: "13VPLUS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Каталог товарів | 13VPLUS",
    description: "Перегляньте весь каталог жіночого одягу від 13VPLUS.",
    images: [`${process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000"}/images/13VPLUS BLACK PNG 2.png`],
  },
  alternates: {
    canonical: `${process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000"}/catalog`,
  },
};

export default async function CatalogPage() {
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
        category={null}
        season={null}
        subcategory={null}
      />
    </Suspense>
  );
}