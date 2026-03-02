"use client";

interface ProductStructuredDataProps {
  product: {
    id: number;
    name: string;
    description?: string | null;
    price: number;
    discount_percentage?: number | null;
    first_media?: { url: string; type: string } | null;
    category_name?: string | null;
  };
  baseUrl?: string;
  slug?: string; // ЧПУ для URL
}

interface OrganizationStructuredDataProps {
  name?: string;
  url?: string;
  logo?: string;
  baseUrl?: string;
}

const defaultBaseUrl = process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";

/** Schema.org WebSite — для пошукових систем і rich results */
export function WebSiteStructuredData({
  name = "Choice Україна",
  description = "Офіційний представник бренду Choice в Україні. Wellness-комплекси, натуральний догляд та eco-засоби для здоров'я і дому.",
  baseUrl = defaultBaseUrl,
  locale = "uk_UA",
}: {
  name?: string;
  description?: string;
  baseUrl?: string;
  locale?: string;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    description,
    url: baseUrl,
    inLanguage: locale,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/catalog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "Choice Україна",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/images/browser-open.png`,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function ProductStructuredData({ product, baseUrl = defaultBaseUrl, slug }: ProductStructuredDataProps) {
  const imageUrl = product.first_media
    ? `${baseUrl}/api/images/${product.first_media.url}`
    : `${baseUrl}/images/browser-open.png`;
  const productUrl = slug ? `${baseUrl}/product/${slug}` : `${baseUrl}/product/${product.id}`;

  const offer = {
    "@type": "Offer",
    price: product.discount_percentage
      ? (product.price * (1 - product.discount_percentage / 100)).toFixed(2)
      : product.price.toFixed(2),
    priceCurrency: "UAH",
    availability: "https://schema.org/InStock",
    url: productUrl,
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} — Choice`,
    image: imageUrl,
    brand: {
      "@type": "Brand",
      name: "Choice",
    },
    category: product.category_name || "Wellness",
    offers: offer,
    sku: `choice-${product.id}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function OrganizationStructuredData({
  name = "Choice Україна",
  url,
  logo,
  baseUrl = defaultBaseUrl,
}: OrganizationStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: url || baseUrl,
    logo: logo || `${baseUrl}/images/browser-open.png`,
    sameAs: [
      "https://www.instagram.com/my_choice_mari",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      availableLanguage: ["Ukrainian"],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function BreadcrumbStructuredData({ items }: { items: { name: string; url: string }[] }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface CollectionPageStructuredDataProps {
  name: string;
  description: string;
  url: string;
  baseUrl: string;
  itemCount?: number;
  category?: string;
}

export function CollectionPageStructuredData({
  name,
  description,
  url,
  baseUrl,
  itemCount = 0,
  category,
}: CollectionPageStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: itemCount,
      ...(category && {
        itemListElement: {
          "@type": "ListItem",
          name: category,
        },
      }),
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Головна",
          item: baseUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Каталог",
          item: `${baseUrl}/catalog`,
        },
        ...(category
          ? [
              {
                "@type": "ListItem",
                position: 3,
                name: category,
                item: url,
              },
            ]
          : []),
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

