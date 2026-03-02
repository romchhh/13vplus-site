import { Suspense } from "react";
import dynamic from "next/dynamic";
import Hero from "@/components/main-page/Hero";
import CategoriesShowcase from "@/components/main-page/CategoriesShowcase";

// Lazy load components that are below the fold
const Bestsellers = dynamic(() => import("@/components/main-page/Bestsellers"), {
  loading: () => <div className="h-64 animate-pulse bg-[#FFF9F0]" />
});
const AboutChoiceSection = dynamic(() => import("@/components/main-page/AboutChoiceSection"), {
  loading: () => <div className="h-64 animate-pulse bg-[#FFF9F0]" />
});
const FeaturesSection = dynamic(() => import("@/components/main-page/FeaturesSection"), {
  loading: () => <div className="h-32 animate-pulse bg-white" />
});

// ISR - Regenerate page every 5 minutes
export const revalidate = 300;

// Optimize runtime
export const runtime = 'nodejs';

// Metadata for SEO
export const metadata = {
  title: "Choice — Офіційний представник в Україні | Eco та wellness",
  description: "Офіційний представник бренду Choice в Україні. Wellness-комплекси, натуральний догляд та eco-засоби для здоров'я і дому.",
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  return (
    <>
      {/* Critical above-the-fold content */}
      <Hero />
      
      {/* Suspense boundary for categories — fallback must match CategoriesShowcase loading state to avoid hydration mismatch */}
      <Suspense
        fallback={
          <section className="w-full bg-[#FFFFFF] py-16 lg:py-20">
            <div className="max-w-[1920px] mx-auto px-6">
              <p className="text-[#3D1A00] font-['Montserrat']">Завантаження категорій...</p>
            </div>
          </section>
        }
      >
        <CategoriesShowcase />
      </Suspense>

      <Suspense fallback={<div className="h-64 bg-[#FFFFFF] animate-pulse" />}>
        <Bestsellers />
      </Suspense>

      <AboutChoiceSection />

      <FeaturesSection />
    </>
  );
}
