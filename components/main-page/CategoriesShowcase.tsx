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
  const [isMobile, setIsMobile] = useState(true);

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

  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      );
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScrollability();
      container.addEventListener("scroll", checkScrollability);
      window.addEventListener("resize", checkScrollability);
      return () => {
        container.removeEventListener("scroll", checkScrollability);
        window.removeEventListener("resize", checkScrollability);
      };
    }
  }, [categories]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-lg text-white bg-black">
        Завантаження категорій...
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="max-w-[1920px] w-full mx-auto relative bg-black pb-16 lg:pb-24">
      {/* Stylish Divider and Title Section */}
      <div className="relative py-16 lg:py-24 px-6 overflow-hidden bg-black">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold font-['Montserrat'] uppercase tracking-tight text-white mb-6 leading-tight">
            Колекції
          </h2>
          <p className="text-sm lg:text-base font-['Montserrat'] text-white/60 max-w-xl mx-auto tracking-wide">
            Кожна категорія — це унікальний світ стилю та оригінальності
          </p>
        </div>
      </div>

      {/* Fixed centered text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="text-white text-2xl md:text-3xl lg:text-4xl font-bold font-['Montserrat'] uppercase tracking-wider text-center px-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] mt-24 md:mt-28">
          АКТУАЛЬНО ЗАРАЗ
        </div>
      </div>

      {/* Scroll container */}
      <div className="relative h-screen">
        {/* Navigation arrows - fixed outside scroll container */}
        <button
          onClick={scrollLeft}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white hover:text-white/80 transition-colors duration-200 pointer-events-auto"
          aria-label="Прокрутити вліво"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <button
          onClick={scrollRight}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white hover:text-white/80 transition-colors duration-200 pointer-events-auto"
          aria-label="Прокрутити вправо"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
        <div className="h-screen overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth" ref={scrollContainerRef}>
        <div className="flex gap-4 md:gap-4 lg:gap-6 h-full items-center">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/catalog?category=${encodeURIComponent(category.name)}`}
              className="group relative flex-shrink-0 flex flex-col h-full"
              style={{
                width:
                  index === 0 && isMobile
                    ? "100vw"
                    : "calc(100vh * 2 / 3)",
              }}
              aria-label={`Переглянути категорію ${category.name}`}
            >
              <div className="h-full w-full overflow-hidden relative bg-black/5">
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
                      <div className="bg-transparent border-2 border-white text-white px-8 py-2.5 text-lg font-medium font-['Montserrat'] uppercase tracking-wider group-hover:bg-white group-hover:text-black transition-colors duration-300">
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
                      <div className="bg-transparent border-2 border-white text-white px-8 py-2.5 text-lg font-medium font-['Montserrat'] uppercase tracking-wider group-hover:bg-white group-hover:text-black transition-colors duration-300">
                        {category.name}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Link>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}

