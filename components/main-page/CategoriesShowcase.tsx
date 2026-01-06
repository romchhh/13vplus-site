"use client";

import { useEffect, useState } from "react";
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
            Кожна категорія — це унікальний світ стилю та елегантності
          </p>
        </div>
      </div>

      {/* Fixed centered text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="text-white text-3xl md:text-4xl lg:text-5xl font-bold font-['Montserrat'] uppercase tracking-wider text-center px-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] mt-16 md:mt-20">
          АКТУАЛЬНО ЗАРАЗ
        </div>
      </div>

      {/* Scroll container */}
      <div className="relative h-screen overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth">
        <div className="flex gap-4 md:gap-4 lg:gap-6 h-full items-center">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/catalog?category=${encodeURIComponent(category.name)}`}
              className="group relative flex-shrink-0 flex flex-col h-full"
              style={{ width: "calc(100vh * 2 / 3)" }}
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
    </section>
  );
}

