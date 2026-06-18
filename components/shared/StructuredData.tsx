"use client";

import {
  SITE_EMAIL,
  SITE_PHONE_TEL,
  SITE_STORE_LOCATION,
  SITE_TELEGRAM_URL,
} from "@/lib/siteContacts";
import { BRAND_ALTERNATE_NAMES, BRAND_NAME } from "@/lib/seo";

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

const defaultBaseUrl = process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";
export function ProductStructuredData({ product, baseUrl = defaultBaseUrl }: ProductStructuredDataProps) {
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
      name: BRAND_NAME,
      alternateName: [...BRAND_ALTERNATE_NAMES],
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
  url,
  logo,
  baseUrl = defaultBaseUrl,
}: OrganizationStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    alternateName: [...BRAND_ALTERNATE_NAMES],
    url: url || baseUrl,
    logo: logo || `${baseUrl}/images/13VPLUS BLACK PNG 2.png`,
    email: SITE_EMAIL,
    sameAs: [
      "https://www.instagram.com/13vplus",
      SITE_TELEGRAM_URL,
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      telephone: SITE_PHONE_TEL.replace("tel:", ""),
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

export function WebSiteStructuredData({ baseUrl = defaultBaseUrl }: { baseUrl?: string }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND_NAME,
    alternateName: [...BRAND_ALTERNATE_NAMES],
    url: baseUrl,
    inLanguage: "uk-UA",
    publisher: {
      "@type": "Organization",
      name: BRAND_NAME,
      alternateName: [...BRAND_ALTERNATE_NAMES],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function LocalBusinessStructuredData({ baseUrl = defaultBaseUrl }: { baseUrl?: string }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: BRAND_NAME,
    alternateName: [...BRAND_ALTERNATE_NAMES],
    url: baseUrl,
    image: `${baseUrl}/images/13VPLUS BLACK PNG 2.png`,
    telephone: SITE_PHONE_TEL.replace("tel:", ""),
    email: SITE_EMAIL,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_STORE_LOCATION.streetAddress,
      addressLocality: SITE_STORE_LOCATION.city,
      addressCountry: SITE_STORE_LOCATION.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE_STORE_LOCATION.latitude,
      longitude: SITE_STORE_LOCATION.longitude,
    },
    hasMap: SITE_STORE_LOCATION.mapsUrl,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "09:00",
        closes: "19:00",
      },
    ],
    sameAs: [
      "https://www.instagram.com/13vplus",
      SITE_TELEGRAM_URL,
    ],
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

