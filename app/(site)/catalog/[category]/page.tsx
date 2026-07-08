import { redirect } from "next/navigation";
import { DEFAULT_PRODUCT_GENDER } from "@/lib/productGender";

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

/** Старі URL /catalog/[category] → /catalog?gender=women&category=... */
export default async function LegacyCategoryPage({ params }: PageProps) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  redirect(
    `/catalog?gender=${DEFAULT_PRODUCT_GENDER}&category=${encodeURIComponent(decodedCategory)}`
  );
}
