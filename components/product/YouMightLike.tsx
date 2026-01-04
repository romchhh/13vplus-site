"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { getProductImageSrc } from "@/lib/getFirstProductImage";
import { useProducts } from "@/lib/useProducts";

export default function YouMightLike() {
  const { products: allProducts, loading } = useProducts();

  // Shuffle and pick 4 random products
  const products = useMemo(() => {
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }, [allProducts]);

  if (loading) return null; // or a spinner

  return (
    <section className="max-w-[1920px] w-full mx-auto px-4 md:px-0 py-16 lg:py-24">
      <div className="flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-0 border-b border-black/10 pb-8 lg:pb-12 mx-0 md:mx-10">
          <h2 className="text-3xl lg:text-5xl font-bold font-['Montserrat'] uppercase tracking-wider text-black">
            Завершіть look
          </h2>
          <p className="text-base lg:text-xl font-light font-['Montserrat'] text-black/60 leading-relaxed max-w-2xl tracking-wide">
            Доповніть свій образ ідеальними акцентами. Рекомендації, які допоможуть створити цілісний стиль.
          </p>
        </div>

        {/* Products list - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:pl-10">
          {products.map((product) => {
            const isVideo = product.first_media?.type === "video";
            
            return (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="flex flex-col gap-2 group w-full"
              >
                <div className="relative w-full aspect-[2/3] bg-black group-hover:filter group-hover:brightness-90 transition duration-300 overflow-hidden">
                  {isVideo && product.first_media ? (
                    <video
                      src={`/api/images/${product.first_media.url}`}
                      className="object-cover transition-all duration-300 group-hover:brightness-90 w-full h-full"
                      loop
                      muted
                      playsInline
                      autoPlay
                      preload="metadata"
                    />
                  ) : product.first_media ? (
                    <Image
                      src={getProductImageSrc(
                        product.first_media,
                        "https://placehold.co/432x613"
                      )}
                      alt={`${product.name} від 13VPLUS`}
                      fill
                      className="object-cover transition-all duration-300 group-hover:brightness-90"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      loading="lazy"
                      quality={75}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                      Немає зображення
                    </div>
                  )}
                </div>
                <span className="text-base sm:text-lg">
                  {product.name}
                  <br /> {product.price}₴
                </span>
              </Link>
            );
          })}
        </div>

        {/* More products button container */}
        <div className="w-full max-w-full sm:max-w-[1824px] h-[300px] sm:h-[679px] relative overflow-hidden mx-auto">
          <Image
            src="/images/more-products-bg.jpg"
            alt="Більше товарів"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1824px"
            priority
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center gap-6 md:gap-8 p-6 md:p-10">
            <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-['Montserrat'] uppercase text-center tracking-wider">
              Досліджуйте Колекцію
            </h2>
            <Link
              href="/catalog"
              className="cursor-pointer w-48 sm:w-56 md:w-64 lg:w-72 h-14 sm:h-16 md:h-18 lg:h-20 p-2 bg-transparent border-2 border-white text-white inline-flex justify-center items-center gap-2 hover:bg-white hover:text-black transition-all duration-300 font-['Montserrat'] group"
            >
              <div className="text-center justify-center text-base sm:text-lg md:text-xl lg:text-2xl font-normal uppercase tracking-wider leading-none">
                Більше товарів
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
