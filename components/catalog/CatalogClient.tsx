"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import SidebarFilter from "../layout/SidebarFilter";
import { useAppContext } from "@/lib/GeneralProvider";
import SidebarMenu from "../layout/SidebarMenu";
import Link from "next/link";
import Image from "next/image";
import { getProductImageSrc, getFirstMedia } from "@/lib/getFirstProductImage";

interface Product {
  id: number;
  name: string;
  price: number;
  first_media?: { url: string; type: string } | null;
  sizes?: { size: string; stock: string }[];
  color?: string;
  discount_percentage?: number;
  category_id?: number | null;
}

interface Color {
  color: string;
  hex?: string;
}

interface Category {
  id: number;
  name: string;
}

interface CatalogClientProps {
  initialProducts: Product[];
  colors: Color[];
  categories: Category[];
}

export default function CatalogClient({
  initialProducts,
  colors,
  categories,
}: CatalogClientProps) {
  const { isSidebarOpen, setIsSidebarOpen } = useAppContext();
  const searchParams = useSearchParams();

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [sortOrder, setSortOrder] = useState<"recommended" | "newest" | "asc" | "desc" | "sale">("recommended");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const matchesSize =
        selectedSizes.length === 0 ||
        product.sizes?.some((s) => selectedSizes.includes(s.size));

      const matchesColor =
        selectedColors.length === 0 ||
        (product.color && selectedColors.includes(product.color));

      const matchesCategory =
        selectedCategories.length === 0 ||
        (product.category_id && selectedCategories.includes(product.category_id));

      const matchesMinPrice = minPrice === null || product.price >= minPrice;
      const matchesMaxPrice = maxPrice === null || product.price <= maxPrice;

      return matchesSize && matchesMinPrice && matchesMaxPrice && matchesColor && matchesCategory;
    });
  }, [initialProducts, selectedSizes, minPrice, maxPrice, selectedColors, selectedCategories]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortOrder) {
      case "asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "desc":
        return sorted.sort((a, b) => b.price - a.price);
      case "newest":
        return sorted.sort((a, b) => b.id - a.id);
      case "sale":
        return sorted.sort((a, b) => {
          const aHasSale = a.discount_percentage ? 1 : 0;
          const bHasSale = b.discount_percentage ? 1 : 0;
          return bHasSale - aHasSale;
        });
      case "recommended":
      default:
        return sorted;
    }
  }, [filteredProducts, sortOrder]);

  const category = searchParams.get("category");
  const season = searchParams.get("season");
  const subcategory = searchParams.get("subcategory");

  const [visibleCount, setVisibleCount] = useState(12);

  const visibleProducts = useMemo(() => {
    return sortedProducts.slice(0, visibleCount);
  }, [sortedProducts, visibleCount]);

  return (
    <>
      <section className="max-w-[1824px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-10 mb-20">
        {/* Top Controls */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="cursor-pointer text-2xl sm:text-3xl text-gray-700 hover:text-gray-900 transition-colors"
            >
              {"<"}
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-['Montserrat'] uppercase tracking-wider text-gray-900">
              {subcategory
                ? subcategory
                : category
                ? category
                : season
                ? `Сезон ${season}`
                : "Усі товари"}
            </h1>
          </div>

          <button
            className="cursor-pointer text-base sm:text-lg font-medium font-['Montserrat'] uppercase tracking-wider text-gray-700 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-900 transition-all px-2 py-1"
            onClick={() => setIsFilterOpen(true)}
          >
            Фільтри
          </button>
        </div>

        {/* Product Grid - Mobile Optimized */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
          {visibleProducts.map((product, index) => {
            // Debug logging
            if (product.first_media) {
              console.log(`[CatalogClient] Product ${product.id} - first_media:`, product.first_media);
            }
            
            return (
            <Link
              href={`/product/${product.id}`}
              key={product.id}
              className="flex flex-col gap-2 group"
            >
              {/* Image or Video - Smaller with padding */}
              <div className="relative w-full aspect-[3/4] bg-white overflow-hidden">
                {product.first_media?.type === "video" ? (
                  <video
                    src={`/api/images/${product.first_media.url}`}
                    className="object-cover transition-all duration-300 group-hover:opacity-95 w-full h-full"
                    loop
                    muted
                    playsInline
                    autoPlay
                    preload="metadata"
                  />
                ) : (
                  <Image
                    src={getProductImageSrc(product.first_media)}
                    alt={`${product.name} від 13VPLUS`}
                    className="object-cover transition-all duration-300 group-hover:opacity-95"
                    fill
                    sizes="(max-width: 420px) 45vw, (max-width: 640px) 45vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    loading={index < 6 ? "eager" : "lazy"}
                    priority={index < 4}
                    quality={index < 8 ? 85 : 75}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  />
                )}
              </div>

              {/* Product Title + Price - More prominent */}
              <div className="flex flex-col gap-1">
                <h3 className="text-sm sm:text-base font-semibold font-['Montserrat'] text-gray-900 leading-snug uppercase tracking-wider">
                  {product.name}
                </h3>
                {product.discount_percentage ? (
                  <div className="flex items-baseline gap-1 flex-wrap">
                    {/* Discounted price */}
                    <span className="font-bold text-gray-900 text-base sm:text-lg tracking-tight">
                      {(
                        product.price *
                        (1 - product.discount_percentage / 100)
                      ).toFixed(0)}
                      ₴
                    </span>

                    {/* Original (crossed-out) price */}
                    <span className="text-gray-400 line-through text-sm font-normal">
                      {product.price}₴
                    </span>

                    {/* Discount badge */}
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                      -{product.discount_percentage}%
                    </span>
                  </div>
                ) : (
                  <span className="font-bold text-gray-900 text-base sm:text-lg tracking-tight">{product.price}₴</span>
                )}
              </div>
              </Link>
            );
          })}
        </div>
        {visibleCount < sortedProducts.length && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 12)}
              className="cursor-pointer px-8 py-3 bg-gray-900 text-white font-medium font-['Montserrat'] uppercase tracking-wider hover:bg-gray-800 transition-colors duration-300"
            >
              Показати ще
            </button>
          </div>
        )}
      </section>

      <SidebarFilter
        isOpen={isFilterOpen}
        setIsOpen={setIsFilterOpen}
        openAccordion={null}
        setOpenAccordion={() => {}}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        selectedSizes={selectedSizes}
        setSelectedSizes={setSelectedSizes}
        minPrice={minPrice}
        maxPrice={maxPrice}
        setMinPrice={setMinPrice}
        setMaxPrice={setMaxPrice}
        selectedColors={selectedColors}
        setSelectedColors={setSelectedColors}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        colors={colors}
        categories={categories}
        products={initialProducts}
        filteredCount={filteredProducts.length}
      />

      {/* Menu Sidebar */}
      <SidebarMenu
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
    </>
  );
}
