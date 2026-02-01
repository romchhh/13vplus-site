"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SidebarFilter from "../layout/SidebarFilter";
import { useAppContext } from "@/lib/GeneralProvider";
import SidebarMenu from "../layout/SidebarMenu";
import Link from "next/link";
import Image from "next/image";
import { getProductImageSrc } from "@/lib/getFirstProductImage";
import ProductSkeleton from "./ProductSkeleton";
import { useWishlist } from "@/lib/WishlistProvider";
import { useSession } from "next-auth/react";

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
  const { isInWishlist, toggleWishlist, setWishlist } = useWishlist();
  const { data: session } = useSession();

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [sortOrder, setSortOrder] = useState<"recommended" | "newest" | "asc" | "desc" | "sale">("recommended");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);

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

  // Show loading state when filters change
  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => setIsFiltering(false), 300);
    return () => clearTimeout(timer);
  }, [selectedSizes, selectedColors, selectedCategories, minPrice, maxPrice, sortOrder]);

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
      <section className="max-w-[1824px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 mt-2 mb-20">
        {/* Top Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="cursor-pointer text-2xl sm:text-3xl text-gray-700 hover:text-gray-900 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Відкрити меню"
            >
              {"<"}
            </button>
            <h1 className="text-base sm:text-lg font-medium font-['Montserrat'] uppercase tracking-wider text-gray-900 flex items-center">
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
            className="cursor-pointer text-base sm:text-lg font-medium font-['Montserrat'] uppercase tracking-wider text-gray-700 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-900 transition-all px-2 py-1 min-w-[44px] min-h-[44px] flex items-center justify-center gap-2 relative"
            onClick={() => setIsFilterOpen(true)}
            aria-label="Відкрити фільтри"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Фільтри
            {(selectedSizes.length > 0 || selectedColors.length > 0 || selectedCategories.length > 0 || minPrice !== null || maxPrice !== null) && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {(selectedSizes.length + selectedColors.length + selectedCategories.length + (minPrice !== null ? 1 : 0) + (maxPrice !== null ? 1 : 0))}
              </span>
            )}
          </button>
        </div>

        {/* Product Grid - Mobile Optimized */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
          {isFiltering ? (
            // Show skeletons while filtering
            Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={`skeleton-${index}`} />
            ))
          ) : visibleProducts.length === 0 ? (
            // Empty state
            <div className="col-span-full flex flex-col items-center justify-center py-20 lg:py-32 gap-6">
              <div className="relative">
                <svg
                  className="w-20 h-20 lg:w-24 lg:h-24 text-black/10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <div className="flex flex-col items-center gap-3 text-center max-w-md">
                <h3 className="text-2xl lg:text-3xl font-bold font-['Montserrat'] uppercase tracking-wider text-black">
                  Товарів не знайдено
                </h3>
                <p className="text-base lg:text-lg font-light font-['Montserrat'] text-black/50 leading-relaxed tracking-wide">
                  Спробуйте змінити параметри фільтрів або перегляньте інші категорії колекції
                </p>
              </div>
            </div>
          ) : (
            visibleProducts.map((product, index) => (
            <Link
              href={`/product/${product.id}`}
              key={product.id}
              className="flex flex-col gap-2 group"
            >
              {/* Image or Video - Smaller with padding */}
              <div className="relative w-full aspect-[3/4] bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const inList = isInWishlist(product.id);
                    toggleWishlist(product.id);
                    if (session?.user) {
                      try {
                        if (inList) {
                          await fetch(`/api/users/wishlist/${product.id}`, { method: "DELETE" });
                        } else {
                          const res = await fetch("/api/users/wishlist", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ productId: product.id }),
                          });
                          if (!res.ok) throw new Error("Failed to add");
                        }
                        const listRes = await fetch("/api/users/wishlist");
                        if (listRes.ok) {
                          const data = await listRes.json();
                          const ids = Array.isArray(data?.productIds) ? data.productIds : [];
                          setWishlist(ids);
                        }
                      } catch {
                        toggleWishlist(product.id);
                      }
                    }
                  }}
                  className="absolute top-2 right-2 z-10 p-1.5 rounded-md bg-white/80 hover:bg-white shadow-sm transition-colors"
                  title={isInWishlist(product.id) ? "Прибрати з вішлиста" : "Додати у вішлист"}
                  aria-label={isInWishlist(product.id) ? "Прибрати з вішлиста" : "Додати у вішлист"}
                >
                  <svg
                    className={`w-4 h-4 ${isInWishlist(product.id) ? "text-amber-600 fill-amber-600" : "text-gray-600"}`}
                    fill={isInWishlist(product.id) ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </button>
                {product.first_media?.type === "video" ? (
                  <video
                    src={`/api/images/${product.first_media.url}`}
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
                    sizes="(max-width: 420px) 45vw, (max-width: 640px) 45vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    loading={index < 8 ? "eager" : "lazy"}
                    priority={index < 4}
                    quality={index < 8 ? 85 : 75}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  />
                )}
              </div>

              {/* Product Title + Price - More prominent */}
              <div className="flex flex-col gap-1">
                <h3 className="text-sm sm:text-base font-normal font-['Montserrat'] text-gray-900 leading-snug uppercase tracking-wider">
                  {product.name}
                </h3>
                {product.discount_percentage ? (
                  <div className="flex items-baseline gap-1 flex-wrap">
                    {/* Original (crossed-out) price */}
                    <span className="text-gray-900 line-through text-base sm:text-lg font-normal">
                      {product.price.toLocaleString()} ₴
                    </span>

                    {/* Discount badge */}
                    <span className="text-gray-900 text-base sm:text-lg font-normal">
                      -{product.discount_percentage}%
                    </span>

                    {/* Discounted price */}
                    <span className="font-bold text-red-800 text-base sm:text-lg tracking-tight">
                      {(
                        product.price *
                        (1 - product.discount_percentage / 100)
                      ).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ₴
                    </span>
                  </div>
                ) : (
                  <span className="font-bold text-gray-900 text-base sm:text-lg tracking-tight">{product.price}₴</span>
                )}
              </div>
              </Link>
            )))}
        </div>
        {visibleCount < sortedProducts.length && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 12)}
              className="cursor-pointer px-8 py-3 bg-black text-white font-medium font-['Montserrat'] uppercase tracking-wider hover:bg-gray-900 transition-colors duration-300 min-w-[44px] min-h-[44px]"
              aria-label="Показати більше товарів"
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
