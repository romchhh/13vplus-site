"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

interface Category {
  id: number;
  name: string;
  priority: number;
  mediaType?: string | null;
  mediaUrl?: string | null;
}

export default function CategoriesShowcase() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data: Category[] = await res.json();
        // Filter categories that have media
        const categoriesWithMedia = data.filter(
          (cat) => cat.mediaUrl && cat.mediaType
        );
        setCategories(categoriesWithMedia);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // Check scroll position and update arrow visibility
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // Scroll functions
  const scrollLeft = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Check scroll position on mount and scroll events
  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);
      // Check after a short delay to ensure layout is complete
      setTimeout(checkScrollPosition, 100);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
      }
    };
  }, [categories]);

  if (loading) {
    return (
      <div className="text-center py-20 text-lg text-black">
        Завантаження категорій...
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="max-w-[1920px] w-full mx-auto relative bg-white pb-16 lg:pb-24">
      {/* Stylish Divider and Title Section */}
      <div className="relative py-16 lg:py-24 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-block mb-6">
            <span className="text-sm lg:text-base font-['Montserrat'] uppercase tracking-[0.3em] text-black/50 font-light">
              Досліджуйте
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold font-['Montserrat'] uppercase tracking-tight text-black mb-6 leading-tight">
            Колекції
          </h2>
          <p className="text-sm lg:text-base font-['Montserrat'] text-black/60 max-w-xl mx-auto tracking-wide">
            Кожна категорія — це унікальний світ стилю та елегантності
          </p>
        </div>
      </div>

      {/* Fixed centered text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="text-white text-4xl md:text-5xl lg:text-6xl font-bold font-['Montserrat'] uppercase tracking-wider text-center px-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
          АКТУАЛЬНО ЗАРАЗ
        </div>
      </div>
      
      {/* Navigation arrows and scroll container */}
      <div className="relative">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white/90 hover:bg-white border border-black/10 hover:border-black/30 rounded-full shadow-lg transition-all duration-200 group"
            aria-label="Прокрутити вліво"
          >
            <svg
              className="w-6 h-6 md:w-7 md:h-7 text-black group-hover:text-black/80 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white/90 hover:bg-white border border-black/10 hover:border-black/30 rounded-full shadow-lg transition-all duration-200 group"
            aria-label="Прокрутити вправо"
          >
            <svg
              className="w-6 h-6 md:w-7 md:h-7 text-black group-hover:text-black/80 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}

        <div
          ref={scrollContainerRef}
          className="overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth"
        >
          <div className="flex gap-4 md:gap-6 min-w-max px-4 md:px-6">
          {categories.map((category, index) => (
            <div key={category.id} className="flex items-center">
              <Link
                href={`/catalog?category=${encodeURIComponent(category.name)}`}
                className="group relative flex-shrink-0 flex flex-col"
                style={{ width: "42.5vw", minWidth: "340px", maxWidth: "510px" }}
                aria-label={`Переглянути категорію ${category.name}`}
              >
                <div className="aspect-[2/3] w-full overflow-hidden relative bg-black/5">
                  {category.mediaType === "video" ? (
                    <>
                      <video
                        src={`/api/images/${category.mediaUrl}`}
                        className="object-cover group-hover:opacity-90 transition duration-300 w-full h-full"
                        loop
                        muted
                        playsInline
                        autoPlay
                        preload="metadata"
                      />
                      {/* Button overlay for video */}
                      <div className="absolute inset-0 flex items-end justify-center pb-8 pointer-events-none">
                        <div className="bg-transparent border-2 border-white text-white px-8 py-4 text-lg font-medium font-['Montserrat'] uppercase tracking-wider group-hover:bg-white group-hover:text-black transition-colors duration-300">
                          {category.name}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Image
                        className="object-cover group-hover:opacity-90 transition duration-300"
                        src={`/api/images/${category.mediaUrl}`}
                        alt={`Категорія ${category.name} від 13VPLUS`}
                        fill
                        sizes="(max-width: 640px) 85vw, (max-width: 1024px) 42.5vw, 510px"
                        loading="lazy"
                        quality={80}
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                      />
                      {/* Button overlay for image */}
                      <div className="absolute inset-0 flex items-end justify-center pb-8 pointer-events-none">
                        <div className="bg-transparent border-2 border-white text-white px-8 py-4 text-lg font-medium font-['Montserrat'] uppercase tracking-wider group-hover:bg-white group-hover:text-black transition-colors duration-300">
                          {category.name}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Link>
              {/* Vertical divider between categories */}
              {index < categories.length - 1 && (
                <div className="w-px h-3/4 bg-black/10 mx-2 md:mx-3" />
              )}
            </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}

