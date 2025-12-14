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
}

interface OrganizationStructuredDataProps {
  name?: string;
  url?: string;
  logo?: string;
  baseUrl?: string;
}

export function ProductStructuredData({ product, baseUrl = process.env.PUBLIC_URL }: ProductStructuredDataProps) {
  const imageUrl = product.first_media
    ? `${baseUrl}/api/images/${product.first_media.url}`
    : `${baseUrl}/images/13VPLUS BLACK PNG 2.png`;

  const offer = {
    "@type": "Offer",
    price: product.discount_percentage
      ? (product.price * (1 - product.discount_percentage / 100)).toFixed(2)
      : product.price.toFixed(2),
    priceCurrency: "UAH",
    availability: "https://schema.org/InStock",
    url: `${baseUrl}/product/${product.id}`,
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} від 13VPLUS`,
    image: imageUrl,
    brand: {
      "@type": "Brand",
      name: "13VPLUS",
    },
    category: product.category_name || "Жіночий одяг",
    offers: offer,
    sku: `13VPLUS-${product.id}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function OrganizationStructuredData({
  name = "13VPLUS",
  url,
  logo,
  baseUrl = process.env.PUBLIC_URL,
}: OrganizationStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: url || baseUrl,
    logo: logo || `${baseUrl}/images/13VPLUS BLACK PNG 2.png`,
    sameAs: [
      "https://www.instagram.com/13vplus",
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

