import { BRAND_NAME, BRAND_SEARCH_PHRASES, SEO_DESCRIPTION } from "@/lib/seo";

/** Видимий для пошукових систем текст бренду на головній (не прихований) */
export default function BrandHomeSeo() {
  return (
    <p className="sr-only">
      {BRAND_NAME} — офіційний сайт бренду {BRAND_SEARCH_PHRASES}. {SEO_DESCRIPTION}
    </p>
  );
}
