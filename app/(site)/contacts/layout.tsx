import type { Metadata } from "next";
import { SEO_DESCRIPTION, SEO_KEYWORDS } from "@/lib/seo";
import { SITE_STORE_LOCATION } from "@/lib/siteContacts";

const baseUrl =
  process.env.PUBLIC_URL ||
  process.env.NEXT_PUBLIC_PUBLIC_URL ||
  "http://localhost:3000";

export const metadata: Metadata = {
  title: "Контакти | 13VPLUS (13 v plus, 13 в плюс)",
  description: `${SEO_DESCRIPTION} Адреса магазину: ${SITE_STORE_LOCATION.address}.`,
  keywords: SEO_KEYWORDS,
  alternates: {
    canonical: `${baseUrl}/contacts`,
  },
  openGraph: {
    title: "Контакти 13VPLUS (13 v plus, 13 в плюс) | Київ",
    description: `Магазин 13 v plus / 13 в плюс у Києві: ${SITE_STORE_LOCATION.address}. Телефон, Telegram, Google Maps.`,
    url: `${baseUrl}/contacts`,
    type: "website",
    locale: "uk_UA",
  },
};

export default function ContactsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
