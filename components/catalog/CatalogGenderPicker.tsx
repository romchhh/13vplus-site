"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  PRODUCT_GENDERS,
  PRODUCT_GENDER_SHORT_LABELS,
  DEFAULT_PRODUCT_GENDER,
  buildCatalogUrl,
} from "@/lib/productGender";
import { getProductImageSrc, resolveProductImageSrc } from "@/lib/getFirstProductImage";

interface Category {
  id: number;
  name: string;
  mediaType?: string | null;
  mediaUrl?: string | null;
}

interface Product {
  id: number;
  name: string;
  price: number;
  first_media?: { url: string; type: string } | null;
  discount_percentage?: number | null;
}

interface CatalogGenderPickerProps {
  categories: Category[];
  products: Product[];
}

export default function CatalogGenderPicker({
  categories,
  products,
}: CatalogGenderPickerProps) {
  const [visibleCount, setVisibleCount] = useState(12);
  const visibleProducts = products.slice(0, visibleCount);

  return (
    <section className="max-w-[1824px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-20">
      {/* Header + gender switch */}
      <div className="flex flex-col items-center text-center gap-5 mb-10 sm:mb-12">
        <div>
          <p className="text-[11px] sm:text-xs font-medium font-['Montserrat'] uppercase tracking-[0.28em] text-black/45 mb-2">
            Каталог 13VPLUS
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-['Montserrat'] uppercase tracking-wider text-black">
            Оберіть колекцію
          </h1>
        </div>

        <div
          className="inline-flex gap-2 p-1 rounded-full bg-neutral-100/80 border border-black/5"
          role="group"
          aria-label="Оберіть колекцію"
        >
          {PRODUCT_GENDERS.map((gender) => (
            <Link
              key={gender}
              href={buildCatalogUrl({ gender })}
              className="min-w-[6.75rem] sm:min-w-[7.5rem] px-4 py-2 rounded-full text-xs sm:text-[13px] font-semibold font-['Montserrat'] uppercase tracking-wider bg-white text-black border border-black/8 shadow-sm hover:bg-black hover:text-white hover:border-black transition-all duration-200"
            >
              {PRODUCT_GENDER_SHORT_LABELS[gender]}
            </Link>
          ))}
        </div>

        <p className="text-sm sm:text-base text-black/55 font-['Montserrat'] max-w-md">
          Переглядайте одяг, створений для вашого стилю та комфорту
        </p>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="mb-12 sm:mb-14">
          <div className="flex items-end justify-between gap-4 mb-5">
            <h2 className="text-sm sm:text-base font-semibold font-['Montserrat'] uppercase tracking-wider text-black">
              Категорії
            </h2>
            <span className="text-xs text-black/40 font-['Montserrat']">
              {categories.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={buildCatalogUrl({
                  gender: DEFAULT_PRODUCT_GENDER,
                  category: category.name,
                })}
                className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-black/10 bg-white text-sm font-medium font-['Montserrat'] text-black hover:border-black hover:bg-black hover:text-white transition-all duration-200"
              >
                {category.mediaUrl && category.mediaType === "photo" ? (
                  <span className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={
                        category.mediaUrl.startsWith("http")
                          ? category.mediaUrl
                          : `/api/images/${category.mediaUrl}`
                      }
                      alt=""
                      fill
                      className="object-cover"
                      sizes="24px"
                    />
                  </span>
                ) : null}
                <span>{category.name}</span>
                <span className="text-black/30 group-hover:text-white/60 transition-colors">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div>
        <div className="flex items-end justify-between gap-4 mb-5">
          <h2 className="text-sm sm:text-base font-semibold font-['Montserrat'] uppercase tracking-wider text-black">
            Усі товари
          </h2>
          <span className="text-xs text-black/40 font-['Montserrat']">
            {products.length}
          </span>
        </div>

        {products.length === 0 ? (
          <div className="py-16 text-center text-black/45 font-['Montserrat']">
            Товарів поки немає
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
              {visibleProducts.map((product, index) => (
                <Link
                  href={`/product/${product.id}`}
                  key={product.id}
                  className="flex flex-col gap-2 group"
                >
                  <div className="relative w-full aspect-[3/4] bg-white overflow-hidden">
                    {product.first_media?.type === "video" ? (
                      <video
                        src={resolveProductImageSrc(product.first_media?.url)}
                        className="object-cover transition-all duration-300 group-hover:opacity-95 w-full h-full"
                        loop
                        muted
                        playsInline
                        autoPlay
                        preload="none"
                      />
                    ) : (
                      <Image
                        src={getProductImageSrc(product.first_media)}
                        alt={`${product.name} від 13VPLUS`}
                        className="object-cover transition-all duration-300 group-hover:opacity-95"
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 33vw, 25vw"
                        loading={index < 8 ? "eager" : "lazy"}
                        priority={index < 4}
                        quality={index < 8 ? 85 : 75}
                      />
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm sm:text-base font-normal font-['Montserrat'] text-gray-900 leading-snug uppercase tracking-wider">
                      {product.name}
                    </h3>
                    {product.discount_percentage ? (
                      <div className="flex items-baseline gap-1 flex-wrap">
                        <span className="text-gray-900 line-through text-base sm:text-lg font-normal">
                          {product.price.toLocaleString()} ₴
                        </span>
                        <span className="text-gray-900 text-base sm:text-lg font-normal">
                          -{product.discount_percentage}%
                        </span>
                        <span className="font-bold text-red-800 text-base sm:text-lg tracking-tight">
                          {(
                            product.price *
                            (1 - product.discount_percentage / 100)
                          )
                            .toFixed(0)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, " ")}{" "}
                          ₴
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-gray-900 text-base sm:text-lg tracking-tight">
                        {product.price}₴
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {visibleCount < products.length && (
              <div className="mt-12 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 12)}
                  className="cursor-pointer px-8 py-3 bg-black text-white font-medium font-['Montserrat'] uppercase tracking-wider hover:bg-gray-900 transition-colors duration-300"
                >
                  Показати ще
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
