import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Про бренд, партнерство, доставка та оплата | Choice",
  description: "Офіційний представник Choice в Україні. Про бренд, партнерство, доставка Нова Пошта та Укрпошта, оплата карткою та при отриманні.",
};

export default function InfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
