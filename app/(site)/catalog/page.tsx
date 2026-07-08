import { Suspense } from "react";
import CatalogServer from "@/components/catalog/CatalogServer";
import CatalogGenderPicker from "@/components/catalog/CatalogGenderPicker";
import type { Metadata } from "next";
import { CatalogGridSkeleton } from "@/components/shared/SkeletonLoader";
import {
  parseProductGender,
  PRODUCT_GENDER_LABELS,
  DEFAULT_PRODUCT_GENDER,
} from "@/lib/productGender";
import { sqlGetAllCategories, sqlGetAllProducts } from "@/lib/sql";

export const revalidate = 1200;

const baseUrl =
  process.env.PUBLIC_URL ||
  process.env.NEXT_PUBLIC_PUBLIC_URL ||
  "http://localhost:3000";

interface PageProps {
  searchParams: Promise<{
    gender?: string;
    category?: string;
    season?: string;
    subcategory?: string;
  }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const gender = parseProductGender(params.gender?.trim());
  const subcategory = params.subcategory?.trim();
  const category = params.category?.trim();
  const season = params.season?.trim();

  const genderLabel = gender ? PRODUCT_GENDER_LABELS[gender] : null;
  const pageLabel = subcategory || category || (season ? `Сезон ${season}` : null);
  const title = pageLabel
    ? `${pageLabel} | ${genderLabel ?? "Каталог"} | 13VPLUS`
    : genderLabel
      ? `${genderLabel} | Каталог | 13VPLUS`
      : "Каталог | 13VPLUS";
  const description = pageLabel
    ? `Каталог «${pageLabel}»${genderLabel ? ` (${genderLabel.toLowerCase()})` : ""} від 13VPLUS.`
    : genderLabel
      ? `Перегляньте колекцію одягу ${genderLabel.toLowerCase()} від 13VPLUS.`
      : "Каталог 13VPLUS — одяг для жінок і чоловіків. Оберіть колекцію або перегляньте всі товари.";

  const query = new URLSearchParams();
  if (gender) query.set("gender", gender);
  if (subcategory) query.set("subcategory", subcategory);
  else if (category) query.set("category", category);
  else if (season) query.set("season", season);
  const catalogUrl = query.size
    ? `${baseUrl}/catalog?${query.toString()}`
    : `${baseUrl}/catalog`;

  return {
    title,
    description,
    alternates: { canonical: catalogUrl },
  };
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const genderFromUrl = parseProductGender(params.gender?.trim());
  const category = params.category?.trim() ?? null;
  const season = params.season?.trim() ?? null;
  const subcategory = params.subcategory?.trim() ?? null;

  // Filtered catalog view (gender required for collection pages)
  const gender =
    genderFromUrl ??
    (category || season || subcategory ? DEFAULT_PRODUCT_GENDER : null);

  if (gender) {
    return (
      <Suspense
        fallback={
          <section className="max-w-[1824px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-10 mb-20">
            <CatalogGridSkeleton count={12} />
          </section>
        }
      >
        <CatalogServer
          gender={gender}
          category={category}
          season={season}
          subcategory={subcategory}
        />
      </Suspense>
    );
  }

  // Hub: gender switch + all categories + all products
  const [categories, products] = await Promise.all([
    sqlGetAllCategories(),
    sqlGetAllProducts(),
  ]);

  return (
    <CatalogGenderPicker
      categories={categories.map((c) => ({
        id: c.id,
        name: c.name,
        mediaType: c.mediaType,
        mediaUrl: c.mediaUrl,
      }))}
      products={products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        first_media: p.first_media,
        discount_percentage: p.discount_percentage,
      }))}
    />
  );
}
