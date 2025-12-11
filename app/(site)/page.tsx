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
const ContactsSection = dynamic(() => import("@/components/main-page/ContactsSection"), {
  loading: () => <div className="h-96 animate-pulse bg-white" />
});
const FAQ = dynamic(() => import("@/components/main-page/FAQ"), {
  loading: () => <div className="h-96 animate-pulse bg-white" />
});
const Reviews = dynamic(() => import("@/components/main-page/Reviews"), {
  loading: () => <div className="h-96 animate-pulse bg-white" />
});

export const revalidate = 300; // ISR every 5 minutes

export default function Home() {
  return (
    <>
      <Hero />
      <CategoriesShowcase />
      <AboutUs />
      <MediaGallery />
      <LimitedEdition />
      <ContactsSection />
      <FAQ />
      <Reviews />
    </>
  );
}
