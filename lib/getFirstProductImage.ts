export const DEFAULT_PRODUCT_IMAGE_FALLBACK =
  "https://placehold.co/800x1200/e5e5e5/666666?text=13VPLUS";

const INVALID_MEDIA_URLS = new Set(["template-placeholder", "placeholder", "null", "undefined"]);

/** Чи можна віддавати url як файл з /api/images/:filename */
export function isValidProductMediaFilename(
  url: string | undefined | null
): boolean {
  if (!url?.trim()) return false;
  const value = url.trim();
  if (INVALID_MEDIA_URLS.has(value.toLowerCase())) return false;
  if (value.startsWith("http://") || value.startsWith("https://")) return true;
  if (value.includes("..") || value.includes("/") || value.includes("\\")) {
    return false;
  }
  return true;
}

/** Повний src для <Image> / <video> */
export function resolveProductImageSrc(
  url: string | undefined | null,
  fallback = DEFAULT_PRODUCT_IMAGE_FALLBACK
): string {
  if (!isValidProductMediaFilename(url)) return fallback;
  const value = url!.trim();
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `/api/images/${value}`;
}

/**
 * Gets the first photo from a product's media array
 */
export function getFirstProductImage(
  media: { url: string; type: string }[] | undefined
): string {
  if (!media || media.length === 0) {
    return "";
  }

  const firstPhoto = media.find((m) => m.type === "photo" && isValidProductMediaFilename(m.url));
  if (firstPhoto?.url) return firstPhoto.url;

  const firstValid = media.find((m) => isValidProductMediaFilename(m.url));
  return firstValid?.url || "";
}

/**
 * Gets the complete image source path for a product
 */
export function getProductImageSrc(
  media:
    | { url: string; type: string }[]
    | { url: string; type: string }
    | undefined
    | null,
  fallback = DEFAULT_PRODUCT_IMAGE_FALLBACK
): string {
  if (media && !Array.isArray(media) && "url" in media) {
    return resolveProductImageSrc(media.url, fallback);
  }

  const imageUrl = getFirstProductImage(
    media as { url: string; type: string }[] | undefined
  );
  return resolveProductImageSrc(imageUrl, fallback);
}

/**
 * Gets the first media (photo or video) from a product's media array
 */
export function getFirstMedia(
  media:
    | { url: string; type: string }[]
    | { url: string; type: string }
    | undefined
    | null
): { url: string; type: string } | null {
  if (!media) return null;

  if (!Array.isArray(media) && "url" in media) {
    return isValidProductMediaFilename(media.url) ? media : null;
  }

  if (Array.isArray(media) && media.length > 0) {
    const valid = media.find((m) => isValidProductMediaFilename(m.url));
    return valid ?? null;
  }

  return null;
}
