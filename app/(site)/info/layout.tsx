import type { Metadata } from "next";
import { SEO_KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Доставка та оплата | 13VPLUS (13 v plus, 13 в плюс)",
  description:
    "Доставка по Україні та в інші країни, оплата, обмін та повернення. 13VPLUS / 13 v plus / 13 в плюс / 13вплюс — український бренд жіночого одягу.",
  keywords: SEO_KEYWORDS,
};

export default function InfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
