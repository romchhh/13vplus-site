"use client";

import React, { useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { getProductImageSrc } from "@/lib/getFirstProductImage";
import { useProducts } from "@/lib/useProducts";

export type YouMightLikeProduct = {
  id: number;
  name: string;
  slug?: string | null;
  price: number;
  first_media?: { url: string; type: string } | null;
  description?: string | null;
};

interface YouMightLikeProps {
  /** Якщо передано — використовуються ці товари (напр. з сервера на сторінці товару). Інакше — клієнтський useProducts(). */
  suggestedProducts?: YouMightLikeProduct[];
}

export default function YouMightLike({ suggestedProducts }: YouMightLikeProps = {}) {
  const { products: clientProducts, loading } = useProducts();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const products = useMemo(() => {
    if (suggestedProducts?.length) {
      return suggestedProducts.slice(0, 8);
    }
    const shuffled = [...clientProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 8);
  }, [suggestedProducts, clientProducts]);

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) container.scrollBy({ left: -320, behavior: "smooth" });
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) container.scrollBy({ left: 320, behavior: "smooth" });
  };

  const isLoading = !suggestedProducts && loading;
  if (isLoading) {
    return (
      <section className="w-full bg-[#FFFFFF] py-12 lg:py-16">
        <div className="max-w-[1920px] mx-auto px-6 lg:px-10">
          <p className="text-[#3D1A00] font-['Montserrat']">Завантаження...</p>
        </div>
      </section>
    );
  }

  if (!products.length) {
    return null;
  }

  return (
    <section className="w-full bg-[#FFFFFF]">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
        {/* Заголовок та стрілки — як у Наші бестселери */}
        <div className="flex items-center justify-between gap-4 mb-8 lg:mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold font-['Montserrat'] uppercase tracking-tight text-[#3D1A00]">
            Схожі товари
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

        {/* Горизонтальний список: 2 на мобільному, 4 на десктопі — як у Bestsellers */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${(product.slug && String(product.slug).trim()) ? product.slug : product.id}`}
              className="flex-shrink-0 w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-4.5rem)/4)] group"
              aria-label={product.name}
            >
              <div className="aspect-[3/4] w-full rounded-lg overflow-hidden bg-gray-200 mb-3 relative">
                {product.first_media?.url ? (
                  product.first_media?.type === "video" ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-[#3D1A00]/50 font-['Montserrat'] text-sm">
                      Відео
                    </div>
                  ) : (
                    <Image
                      src={getProductImageSrc(product.first_media, "")}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 1023px) 50vw, 25vw"
                    />
                  )
                ) : (
                  <div className="absolute inset-0 bg-gray-200" aria-hidden />
                )}
              </div>
              <div className="flex justify-between items-start gap-2">
                <p className="text-[#3D1A00] font-['Montserrat'] font-semibold text-sm lg:text-base line-clamp-2">
                  {product.name}
                </p>
                <span className="text-[#3D1A00] font-['Montserrat'] font-semibold text-sm lg:text-base whitespace-nowrap">
                  {typeof product.price === "number" ? `${product.price.toLocaleString()} ₴` : "—"}
                </span>
              </div>
              <p className="text-gray-500 font-['Montserrat'] text-xs mt-0.5">
                CHOICE
              </p>
              {product.description && (
                <p className="text-gray-500 font-['Montserrat'] text-xs mt-1 line-clamp-2">
                  {product.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
