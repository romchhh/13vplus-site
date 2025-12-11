"use client";

import React, { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Link from "next/link";
import Image from "next/image";
import { getProductImageSrc } from "@/lib/getFirstProductImage";
import { useProducts } from "@/lib/useProducts";

// Define a fallback (template) product
const templateProduct = {
  id: -1,
  name: "Шовкова сорочка без рукавів",
  price: 1780,
  first_media: { type: "photo", url: "template-placeholder" },
  limited_edition: false,
};

export default function LimitedEdition() {
  const { products: limitedEditionProducts, loading } = useProducts({ limitedEdition: true });

  // Fill with template products if there are not enough
  const products = useMemo(() => {
    // Fill up to 8 first (so we still get templates if needed)
    const filled =
      limitedEditionProducts.length < 8
        ? [
            ...limitedEditionProducts,
            ...Array(8 - limitedEditionProducts.length).fill(templateProduct),
          ]
        : limitedEditionProducts;

    // ✅ Then limit to 4
    return filled.slice(0, 4);
  }, [limitedEditionProducts]);

  if (loading) {
    return <div className="text-center py-10 text-black">Завантаження...</div>;
  }

  return (
    <section className="max-w-[1920px] w-full mx-auto relative px-6 py-16 lg:py-24 bg-white">
      <div className="flex flex-col gap-12 lg:gap-16">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-0 border-b border-black/10 pb-8 lg:pb-12">
          <h2 className="text-3xl lg:text-5xl font-bold font-['Montserrat'] uppercase tracking-wider text-black">
            Лімітована колекція від 13VPLUS
          </h2>
          <p className="text-base lg:text-xl font-normal font-['Montserrat'] text-black/70 leading-relaxed max-w-2xl">
            Лімітована колекція — для тих кому важлива унікальність.
          </p>
        </div>

        {/* Mobile layout: Two stacked sliders */}
        <div className="sm:hidden">
          {/* First Slider */}
          <Swiper
            spaceBetween={16}
            slidesPerView={1.5}
            centeredSlides={true}
            grabCursor={true}
            initialSlide={0}
            breakpoints={{
              320: { slidesPerView: 1.2, spaceBetween: 16 },
              480: { slidesPerView: 1.5, spaceBetween: 20 },
            }}
          >
            {products.map((product, i) => (
              <SwiperSlide
                key={product.id !== -1 ? product.id : `template-${i}`}
              >
                <Link
                  href={`/product/${product.id}`}
                  className="w-full group space-y-4 relative"
                >
                  <div className="relative w-full h-[500px] bg-black/5">
                    <Image
                      className="object-cover group-hover:opacity-90 transition duration-300"
                      src={getProductImageSrc(product.first_media, "https://placehold.co/432x682")}
                      alt={product.name}
                      fill
                      sizes="90vw"
                    />
                    {product.first_media?.type === "photo" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/90 text-black px-6 py-3 text-base font-medium font-['Montserrat'] uppercase tracking-wider">
                          Переглянути
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-center space-y-2 mt-4">
                    <div className="text-base font-light font-['Montserrat'] text-black/80 uppercase tracking-wider">
                      {product.name}
                    </div>
                    <div className="text-base font-medium font-['Montserrat'] text-black">
                      {product.price.toLocaleString()} ₴
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Second Slider */}
          <Swiper
            spaceBetween={16}
            slidesPerView={1.5}
            centeredSlides={true}
            grabCursor={true}
            initialSlide={0}
            breakpoints={{
              320: { slidesPerView: 1.2, spaceBetween: 16 },
              480: { slidesPerView: 1.5, spaceBetween: 20 },
            }}
          >
            {products.map((product, i) => (
              <SwiperSlide
                key={product.id !== -1 ? product.id : `template-${i}`}
              >
                <Link
                  href={`/product/${product.id}`}
                  className="w-full group space-y-4 relative"
                >
                  <div className="relative w-full h-[500px] bg-black/5">
                    <Image
                      className="object-cover group-hover:opacity-90 transition duration-300"
                      src={getProductImageSrc(product.first_media, "https://placehold.co/432x682")}
                      alt={product.name}
                      fill
                      sizes="90vw"
                    />
                    {product.first_media?.type === "photo" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/90 text-black px-6 py-3 text-base font-medium font-['Montserrat'] uppercase tracking-wider">
                          Переглянути
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-center space-y-2 mt-4">
                    <div className="text-base font-light font-['Montserrat'] text-black/80 uppercase tracking-wider">
                      {product.name}
                    </div>
                    <div className="text-base font-medium font-['Montserrat'] text-black">
                      {product.price.toLocaleString()} ₴
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Desktop layout: Horizontal scrollable grid */}
        <div className="hidden sm:block overflow-x-auto overflow-y-hidden scrollbar-hide relative">
          <div className="flex gap-4 md:gap-6 min-w-max pb-4 px-4 md:px-6 scroll-smooth">
            {products.map((product, i) => (
              <div key={product.id !== -1 ? product.id : `template-${i}`} className="flex items-center">
                <Link
                  href={`/product/${product.id}`}
                  className="group relative flex-shrink-0 flex flex-col"
                  style={{ width: "42.5vw", minWidth: "340px", maxWidth: "510px" }}
                >
                <div className="aspect-[2/3] w-full overflow-hidden relative bg-black/5">
                  {product.first_media?.type === "video" ? (
                    <video
                      src={`/api/images/${product.first_media.url}`}
                      className="object-cover group-hover:opacity-90 transition duration-300 w-full h-full"
                      loop
                      muted
                      playsInline
                      autoPlay
                      preload="metadata"
                    />
                  ) : (
                    <>
                      <Image
                        className="object-cover group-hover:opacity-90 transition duration-300"
                        src={getProductImageSrc(product.first_media, "https://placehold.co/432x682")}
                        alt={product.name}
                        fill
                        sizes="(max-width: 1024px) 42.5vw, 510px"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/90 text-black px-8 py-4 text-lg font-medium font-['Montserrat'] uppercase tracking-wider">
                          Переглянути
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 text-center space-y-3">
                  <div className="text-base font-light font-['Montserrat'] text-black/80 uppercase tracking-wider">
                    {product.name}
                  </div>
                  <div className="text-lg font-medium font-['Montserrat'] text-black">
                    {product.price.toLocaleString()} ₴
                  </div>
                </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
