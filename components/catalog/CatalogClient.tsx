"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppContext } from "@/lib/GeneralProvider";
import { useBasket } from "@/lib/BasketProvider";
import SidebarMenu from "../layout/SidebarMenu";
import { getProductImageSrc } from "@/lib/getFirstProductImage";
import ProductSkeleton from "./ProductSkeleton";

interface Product {
  id: number;
  name: string;
  slug?: string | null;
  price: number;
  description?: string | null;
  first_media?: { url: string; type: string } | null;
  discount_percentage?: number;
  category_id?: number | null;
}

interface Category {
  id: number;
  name: string;
}

interface CatalogClientProps {
  initialProducts: Product[];
  categories: Category[];
}

export default function CatalogClient({
  initialProducts,
  categories,
}: CatalogClientProps) {
  const { isSidebarOpen, setIsSidebarOpen } = useAppContext();
  const { addItem } = useBasket();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<"recommended" | "newest" | "asc" | "desc" | "sale">("recommended");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  const [basketError, setBasketError] = useState<string | null>(null);

  const priceRange = useMemo(() => {
    if (initialProducts.length === 0) return { min: 0, max: 10000 };
    const prices = initialProducts.map((p) => p.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const matchesCategory =
        selectedCategories.length === 0 ||
        (product.category_id && selectedCategories.includes(product.category_id));
      const matchesMinPrice = minPrice === null || product.price >= minPrice;
      const matchesMaxPrice = maxPrice === null || product.price <= maxPrice;
      return matchesCategory && matchesMinPrice && matchesMaxPrice;
    });
  }, [initialProducts, minPrice, maxPrice, selectedCategories]);

  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => setIsFiltering(false), 200);
    return () => clearTimeout(timer);
  }, [selectedCategories, minPrice, maxPrice, sortOrder]);

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
      default:
        return sorted;
    }
  }, [filteredProducts, sortOrder]);

  const [visibleCount, setVisibleCount] = useState(9);
  const visibleProducts = useMemo(
    () => sortedProducts.slice(0, visibleCount),
    [sortedProducts, visibleCount]
  );

  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    setBasketError(null);
    const imageUrl = getProductImageSrc(product.first_media);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        size: "—",
        quantity: 1,
        imageUrl: imageUrl.startsWith("http") ? imageUrl : `${origin}${imageUrl}`,
        discount_percentage: product.discount_percentage ?? undefined,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Недостатньо товару в наявності";
      setBasketError(message);
      setTimeout(() => setBasketError(null), 5000);
    }
  };

  const handleApplyFilters = () => {
    setMinPrice(minPriceInput ? Number(minPriceInput) : null);
    setMaxPrice(maxPriceInput ? Number(maxPriceInput) : null);
    setMobileFiltersOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setMinPrice(null);
    setMaxPrice(null);
    setMinPriceInput("");
    setMaxPriceInput("");
  };

  const toggleCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <>
      <section className="max-w-[1824px] mx-auto px-4 sm:px-6 lg:px-12 pt-4 pb-20 bg-white min-h-screen">
        {/* Breadcrumbs */}
        <nav className="mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm font-['Montserrat'] text-gray-400">
            <li>
              <Link href="/" className="hover:text-gray-700 transition-colors">
                Головна
              </Link>
            </li>
            <li aria-hidden className="text-gray-300">|</li>
            <li className="text-[#3D1A00]">Каталог товарів</li>
          </ol>
        </nav>

        {/* Великий заголовок по центру */}
        <h1 className="text-center text-3xl sm:text-4xl lg:text-5xl font-extrabold font-['Montserrat'] uppercase tracking-widest text-[#3D1A00] mb-10">
          Каталог товарів
        </h1>

        {/* Мобільна кнопка фільтрів — відкриває ті самі фільтри, що й на десктопі */}
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-['Montserrat'] text-gray-700 hover:border-gray-400 transition-colors"
        >
          <span className="text-lg">≡</span> Фільтри
        </button>

        {/* Мобільна панель фільтрів — ті самі Ціна, Категорія, Очистити, Застосувати */}
        {mobileFiltersOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
              aria-hidden
            />
            <div className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-xl z-50 flex flex-col overflow-y-auto lg:hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-extrabold font-['Montserrat'] uppercase tracking-widest text-[#3D1A00]">
                  Фільтри
                </h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-800 text-2xl leading-none"
                  aria-label="Закрити фільтри"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 p-4 space-y-6">
                {/* Ціна */}
                <div>
                  <h3 className="text-base font-extrabold font-['Montserrat'] uppercase tracking-widest text-[#3D1A00] mb-3">
                    Ціна
                  </h3>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <label className="block text-xs font-['Montserrat'] text-gray-500 mb-1">Від</label>
                      <input
                        type="number"
                        value={minPriceInput}
                        onChange={(e) => setMinPriceInput(e.target.value)}
                        placeholder="Грн"
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm font-['Montserrat'] text-gray-700 placeholder-gray-300 outline-none focus:border-gray-400 transition-colors"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-['Montserrat'] text-gray-500 mb-1">До</label>
                      <input
                        type="number"
                        value={maxPriceInput}
                        onChange={(e) => setMaxPriceInput(e.target.value)}
                        placeholder="Грн"
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm font-['Montserrat'] text-gray-700 placeholder-gray-300 outline-none focus:border-gray-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>
                {/* Категорія товару */}
                <div>
                  <h3 className="text-base font-extrabold font-['Montserrat'] uppercase tracking-widest text-[#3D1A00] mb-3">
                    Категорія товару
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {categories.map((cat) => (
                      <li key={cat.id}>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <span
                            className={`w-4 h-4 flex-shrink-0 border rounded-sm transition-colors ${
                              selectedCategories.includes(cat.id)
                                ? "bg-[#8B9A47] border-[#8B9A47]"
                                : "border-gray-300 group-hover:border-gray-500"
                            }`}
                            onClick={() => toggleCategory(cat.id)}
                          >
                            {selectedCategories.includes(cat.id) && (
                              <svg viewBox="0 0 12 10" fill="none" className="w-full h-full p-0.5">
                                <path d="M1 5l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </span>
                          <span
                            className="text-sm font-['Montserrat'] text-gray-700 group-hover:text-[#3D1A00] transition-colors"
                            onClick={() => toggleCategory(cat.id)}
                          >
                            {cat.name}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Кнопки */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleClearFilters}
                    className="flex-1 py-2.5 px-4 border border-gray-300 rounded text-sm font-semibold font-['Montserrat'] text-gray-700 hover:border-gray-500 hover:text-[#3D1A00] transition-colors"
                  >
                    Очистити
                  </button>
                  <button
                    onClick={handleApplyFilters}
                    className="flex-1 py-2.5 px-4 bg-[#8B9A47] hover:bg-[#7a8940] text-white rounded text-sm font-semibold font-['Montserrat'] transition-colors"
                  >
                    Застосувати
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Основний контент */}
        <div className="flex gap-8 lg:gap-10 items-start">
          {/* Sidebar фільтри — тільки десктоп */}
          <aside className="hidden lg:flex flex-col gap-6 w-[260px] flex-shrink-0">
            {/* Ціна */}
            <div>
              <h2 className="text-base font-extrabold font-['Montserrat'] uppercase tracking-widest text-[#3D1A00] mb-3">
                Ціна
              </h2>
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <label className="block text-xs font-['Montserrat'] text-gray-500 mb-1">Від</label>
                  <input
                    type="number"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    placeholder="Грн"
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm font-['Montserrat'] text-gray-700 placeholder-gray-300 outline-none focus:border-gray-400 transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-['Montserrat'] text-gray-500 mb-1">До</label>
                  <input
                    type="number"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    placeholder="Грн"
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm font-['Montserrat'] text-gray-700 placeholder-gray-300 outline-none focus:border-gray-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Категорії */}
            <div>
              <h2 className="text-base font-extrabold font-['Montserrat'] uppercase tracking-widest text-[#3D1A00] mb-3">
                Категорія товару
              </h2>
              <ul className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <span
                        className={`w-4 h-4 flex-shrink-0 border rounded-sm transition-colors ${
                          selectedCategories.includes(cat.id)
                            ? "bg-[#8B9A47] border-[#8B9A47]"
                            : "border-gray-300 group-hover:border-gray-500"
                        }`}
                        onClick={() => toggleCategory(cat.id)}
                      >
                        {selectedCategories.includes(cat.id) && (
                          <svg viewBox="0 0 12 10" fill="none" className="w-full h-full p-0.5">
                            <path d="M1 5l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span
                        className="text-sm font-['Montserrat'] text-gray-700 group-hover:text-[#3D1A00] transition-colors"
                        onClick={() => toggleCategory(cat.id)}
                      >
                        {cat.name}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Кнопки фільтрів */}
            <div className="flex gap-3">
              <button
                onClick={handleClearFilters}
                className="flex-1 py-2.5 px-4 border border-gray-300 rounded text-sm font-semibold font-['Montserrat'] text-gray-700 hover:border-gray-500 hover:text-[#3D1A00] transition-colors"
              >
                Очистити
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex-1 py-2.5 px-4 bg-[#8B9A47] hover:bg-[#7a8940] text-white rounded text-sm font-semibold font-['Montserrat'] transition-colors"
              >
                Застосувати
              </button>
            </div>
          </aside>

          {/* Сітка товарів */}
          <div className="flex-1 min-w-0">
            {/* Сортування та лічильник */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
              <p className="text-sm font-['Montserrat'] text-gray-500">
                Знайдено:{" "}
                <span className="font-semibold text-[#3D1A00]">{filteredProducts.length}</span>{" "}
                {filteredProducts.length === 1 ? "товар" : "товарів"}
              </p>
              <label className="flex items-center gap-2">
                <span className="text-sm font-['Montserrat'] text-gray-500">Сортування:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                  className="text-sm font-['Montserrat'] border border-gray-200 rounded px-3 py-2 bg-white text-[#3D1A00] focus:ring-2 focus:ring-[#8B9A47]/30 focus:border-[#8B9A47] outline-none"
                >
                  <option value="recommended">Рекомендовані</option>
                  <option value="newest">За новизною</option>
                  <option value="asc">Ціна: за зростанням</option>
                  <option value="desc">Ціна: за спаданням</option>
                  <option value="sale">Спочатку акційні</option>
                </select>
              </label>
            </div>

            {basketError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm font-['Montserrat'] text-red-700">
                {basketError}
              </div>
            )}

            {/* Картки товарів */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 sm:gap-x-5 sm:gap-y-3">
              {isFiltering ? (
                Array.from({ length: 9 }).map((_, i) => (
                  <ProductSkeleton key={`skeleton-${i}`} />
                ))
              ) : visibleProducts.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
                  <h3 className="text-xl font-bold font-['Montserrat'] uppercase tracking-wider text-[#3D1A00]">
                    Товарів не знайдено
                  </h3>
                  <p className="text-sm font-['Montserrat'] text-gray-400 text-center max-w-md">
                    Спробуйте змінити параметри фільтрів або перегляньте інші категорії
                  </p>
                </div>
              ) : (
                visibleProducts.map((product, index) => {
                  const displayPrice = product.discount_percentage
                    ? Math.round(product.price * (1 - product.discount_percentage / 100))
                    : product.price;
                  const rawDesc = product.description
                    ? product.description.replace(/<[^>]*>/g, "").trim()
                    : "";
                  const shortDesc =
                    rawDesc.length > 60 ? rawDesc.slice(0, 60).trim() + "…" : rawDesc || null;

                  return (
                    <Link
                      href={`/product/${(product.slug && String(product.slug).trim()) ? product.slug : product.id}`}
                      key={product.id}
                      className="group flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                      {/* Зображення 3:4 */}
                      <div className="relative w-full aspect-[3/4] bg-gray-50 overflow-hidden">
                        {product.first_media?.type === "video" ? (
                          <video
                            src={`/api/images/${product.first_media.url}`}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-[1.03]"
                            loop
                            muted
                            playsInline
                            autoPlay
                            preload="none"
                          />
                        ) : (
                          <Image
                            src={getProductImageSrc(product.first_media)}
                            alt={`${product.name} від Choice`}
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            fill
                            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 33vw, 25vw"
                            loading={index < 9 ? "eager" : "lazy"}
                            priority={index < 3}
                            quality={index < 9 ? 85 : 75}
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                          />
                        )}
                        {/* Бейдж знижки */}
                        {product.discount_percentage && (
                          <span className="absolute top-2 left-2 text-[10px] font-semibold font-['Montserrat'] text-amber-800/95 bg-amber-100/90 px-1.5 py-0.5 rounded">
                            −{product.discount_percentage}%
                          </span>
                        )}
                      </div>

                      {/* Інфо */}
                      <div className="p-4 flex flex-col gap-1 flex-1">
                        <h3 className="font-['Montserrat'] font-light text-[32px] leading-[97%] tracking-[-0.02em] text-[#3D1A00] align-middle">
                          {product.name}
                        </h3>
                        {shortDesc && (
                          <p className="font-['Montserrat'] font-light text-[11px] leading-[194%] tracking-[-0.02em] text-[#3D1A00] align-middle line-clamp-2">
                            {shortDesc}
                          </p>
                        )}
                        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                          <div className="flex flex-col">
                            {product.discount_percentage && (
                              <span className="font-['Montserrat'] font-normal text-[20px] leading-[159%] tracking-[-0.02em] text-[#3D1A00]/70 line-through">
                                {product.price.toLocaleString("uk-UA")} грн
                              </span>
                            )}
                            <span className="font-['Montserrat'] font-normal text-[20px] leading-[159%] tracking-[-0.02em] text-[#3D1A00] align-middle">
                              {displayPrice.toLocaleString("uk-UA")} грн
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleAddToCart(e, product)}
                            className="py-2 px-4 text-xs sm:text-sm font-semibold font-['Montserrat'] bg-[#8B9A47] hover:bg-[#7a8940] text-white rounded-full transition-colors whitespace-nowrap"
                          >
                            В кошик
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Пагінація / показати ще */}
            {visibleCount < sortedProducts.length && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 9)}
                  className="px-8 py-3 bg-[#3D1A00] text-white font-semibold font-['Montserrat'] uppercase tracking-wider hover:bg-[#3D1A00]/90 transition-colors rounded-lg min-h-[44px]"
                >
                  Показати ще
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <SidebarMenu isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
    </>
  );
}