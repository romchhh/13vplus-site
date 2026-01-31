import { Suspense } from "react";
import dynamic from "next/dynamic";
import Hero from "@/components/main-page/Hero";
import CategoriesShowcase from "@/components/main-page/CategoriesShowcase";

// Lazy load components that are below the fold
const MediaGallery = dynamic(() => import("@/components/main-page/MediaGallery"), {
  loading: () => <div className="h-96 animate-pulse bg-white" />
});
const AboutUs = dynamic(() => import("@/components/main-page/AboutUs"), {
  loading: () => <div className="h-96 animate-pulse bg-white" />
});
const LimitedEdition = dynamic(() => import("@/components/main-page/LimitedEdition"), {
  loading: () => <div className="h-96 animate-pulse bg-white" />
});
const TopSale = dynamic(() => import("@/components/main-page/TopSale"), {
  loading: () => <div className="h-96 animate-pulse bg-white" />
});
const ContactsSection = dynamic(() => import("@/components/main-page/ContactsSection"), {
  loading: () => <div className="h-96 animate-pulse bg-white" />
});
const FAQ = dynamic(() => import("@/components/main-page/FAQ"), {
  loading: () => <div className="h-96 animate-pulse bg-white" />
});

// ISR - Regenerate page every 5 minutes
export const revalidate = 300;

// Optimize runtime
export const runtime = 'nodejs';

// Metadata for SEO
export const metadata = {
  title: '13VPLUS — Жіночий Одяг | Повсякденний, Домашній Одяг та Купальники',
  description: '13VPLUS — український бренд жіночого одягу. Повсякденний одяг, домашній одяг та купальники в мінімалістичному лакшері стилі. Індивідуальний пошив під ваші параметри.',
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  return (
    <>
      {/* Critical above-the-fold content */}
      <Hero />
      
      {/* Suspense boundary for categories */}
      <Suspense fallback={<div className="h-screen bg-black animate-pulse" />}>
        <CategoriesShowcase />
      </Suspense>
      
      {/* Below-the-fold content - lazy loaded */}
      <AboutUs />
      <MediaGallery />
      
      {/* Product sections with Suspense */}
      <Suspense fallback={<div className="h-96 bg-white animate-pulse" />}>
        <LimitedEdition />
      </Suspense>
      
      <Suspense fallback={<div className="h-96 bg-white animate-pulse" />}>
        <TopSale />
      </Suspense>
      
      <ContactsSection />
      <FAQ />
    </>
  );
}
