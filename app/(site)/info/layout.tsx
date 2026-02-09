import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Доставка та оплата | 13VPLUS",
  description: "Доставка по Україні та в інші країни, оплата, обмін та повернення товару. 13VPLUS — український бренд жіночого одягу.",
};

export default function InfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
