"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCategories } from "@/lib/CategoriesProvider";

// Same loading markup as Suspense fallback in page.tsx to avoid hydration mismatch
function CategoriesLoadingPlaceholder() {
  return (
    <section className="w-full bg-[#FFFFFF] py-16 lg:py-20">
      <div className="max-w-[1920px] mx-auto px-6">
        <p className="text-[#3D1A00] font-['Montserrat']">Завантаження категорій...</p>
      </div>
    </section>
  );
}

export default function CategoriesShowcase() {
  const { categories, loading } = useCategories();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) container.scrollBy({ left: -320, behavior: "smooth" });
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) container.scrollBy({ left: 320, behavior: "smooth" });
  };

  // Before mount or while loading: render same placeholder on server and client to avoid hydration error
  if (!mounted || loading) {
    return <CategoriesLoadingPlaceholder />;
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-[#FFFFFF]">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
        {/* Заголовок КАТЕГОРІЇ та стрілки */}
        <div className="flex items-center justify-between gap-4 mb-8 lg:mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold font-['Montserrat'] uppercase tracking-tight text-[#3D1A00]">
            Категорії
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={scrollLeft}
              className="p-2 text-[#3D1A00] hover:opacity-70 transition-opacity"
              aria-label="Прокрутити вліво"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={scrollRight}
              className="p-2 text-[#3D1A00] hover:opacity-70 transition-opacity"
              aria-label="Прокрутити вправо"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Горизонтальний список: на мобільному 2 категорії, на десктопі 4 */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/catalog/${category.slug || encodeURIComponent(category.name)}`}
              className="flex-shrink-0 w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-4.5rem)/4)] group"
              aria-label={`Категорія ${category.name}`}
            >
              <div className="aspect-[3/4] w-full rounded-lg overflow-hidden bg-gray-200 mb-3 relative">
                {category.mediaUrl && category.mediaType ? (
                  category.mediaType === "video" ? (
                    <video
                      src={`/api/images/${category.mediaUrl}`}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      loop
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <Image
                      src={`/api/images/${category.mediaUrl}`}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="260px"
                    />
                  )
                ) : (
                  <div className="absolute inset-0 bg-gray-200" aria-hidden />
                )}
              </div>
              <p className="text-[#3D1A00] font-['Montserrat'] font-semibold text-sm lg:text-base text-left">
                {category.name}
              </p>
            </Link>
          ))}
        </div>

        {/* Весь каталог — справа внизу */}
        <div className="flex justify-end mt-8 lg:mt-10">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1 text-[#8B9A47] font-['Montserrat'] font-semibold hover:opacity-80 transition-opacity"
          >
            Весь каталог
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
