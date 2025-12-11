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
      <div className="text-center py-20 text-lg text-black">
        Завантаження категорій...
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="max-w-[1920px] w-full mx-auto relative bg-white">
      {/* Stylish Divider and Title Section */}
      <div className="relative py-16 lg:py-24 px-6 overflow-hidden">
        {/* Diagonal divider line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/20 to-transparent"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-black/5 transform -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-px bg-black/10 transform -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-block mb-6">
            <span className="text-sm lg:text-base font-['Montserrat'] uppercase tracking-[0.3em] text-black/50 font-light">
              Досліджуйте
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold font-['Montserrat'] uppercase tracking-tight text-black mb-6 leading-tight">
            Колекції
          </h2>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-12 bg-black/30"></div>
            <div className="w-1.5 h-1.5 bg-black/40 rounded-full"></div>
            <div className="h-px w-12 bg-black/30"></div>
          </div>
          <p className="text-sm lg:text-base font-['Montserrat'] text-black/60 max-w-xl mx-auto tracking-wide">
            Кожна категорія — це унікальний світ стилю та елегантності
          </p>
        </div>
        
        {/* Bottom decorative line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/20 to-transparent"></div>
      </div>

      {/* Fixed centered text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="text-white text-4xl md:text-5xl lg:text-6xl font-bold font-['Montserrat'] uppercase tracking-wider text-center px-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
          АКТУАЛЬНО ЗАРАЗ
        </div>
      </div>
      
      <div className="overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth">
        <div className="flex gap-4 md:gap-6 min-w-max px-4 md:px-6">
          {categories.map((category, index) => (
            <div key={category.id} className="flex items-center">
              <Link
                href={`/catalog?category=${encodeURIComponent(category.name)}`}
                className="group relative flex-shrink-0 flex flex-col"
                style={{ width: "42.5vw", minWidth: "340px", maxWidth: "510px" }}
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
                        alt={category.name}
                        fill
                        sizes="(max-width: 1024px) 42.5vw, 510px"
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
    </section>
  );
}

