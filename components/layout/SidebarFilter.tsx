"use client";

import { useEffect, useMemo, useState } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
}

interface Category {
  id: number;
  name: string;
}

interface SidebarFilterProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openAccordion: number | null;
  setOpenAccordion: React.Dispatch<React.SetStateAction<number | null>>;
  sortOrder: "recommended" | "newest" | "asc" | "desc" | "sale";
  setSortOrder: React.Dispatch<React.SetStateAction<"recommended" | "newest" | "asc" | "desc" | "sale">>;
  minPrice: number | null;
  maxPrice: number | null;
  setMinPrice: React.Dispatch<React.SetStateAction<number | null>>;
  setMaxPrice: React.Dispatch<React.SetStateAction<number | null>>;
  selectedCategories: number[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<number[]>>;
  categories: Category[];
  products: Product[];
  filteredCount: number;
}

export default function SidebarFilter({
  isOpen,
  setIsOpen,
  sortOrder,
  setSortOrder,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  selectedCategories,
  setSelectedCategories,
  categories,
  products,
  filteredCount,
}: SidebarFilterProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sort: true,
    category: true,
    price: true,
  });

  // Calculate min and max price from products
  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 10000 };
    const prices = products.map((p) => p.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

  // Initialize price range sliders
  const [localMinPrice, setLocalMinPrice] = useState(minPrice ?? priceRange.min);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice ?? priceRange.max);

  useEffect(() => {
    if (minPrice === null) setLocalMinPrice(priceRange.min);
    if (maxPrice === null) setLocalMaxPrice(priceRange.max);
  }, [priceRange, minPrice, maxPrice]);

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId]
    );
  };

  const handleMinPriceChange = (value: number) => {
    setLocalMinPrice(value);
    setMinPrice(value);
  };

  const handleMaxPriceChange = (value: number) => {
    setLocalMaxPrice(value);
    setMaxPrice(value);
  };

  const handleApplyFilters = () => {
    setIsOpen(false);
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setMinPrice(null);
    setMaxPrice(null);
    setLocalMinPrice(priceRange.min);
    setLocalMaxPrice(priceRange.max);
  };

  const hasActiveFilters = useMemo(() => {
    return (
      selectedCategories.length > 0 ||
      minPrice !== null ||
      maxPrice !== null
    );
  }, [selectedCategories, minPrice, maxPrice]);

  return (
    <div className="relative z-50">
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-4/5 sm:max-w-md bg-white shadow-md z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } overflow-y-auto flex flex-col`}
      >
        {/* Header - Black with white text */}
        <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold font-['Montserrat'] uppercase tracking-wider text-center flex-1">
            ФІЛЬТРИ
          </h2>
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-white/80 hover:text-white underline transition-colors"
                aria-label="Очистити всі фільтри"
              >
                Очистити
              </button>
            )}
          <button
            className="text-white text-2xl hover:text-gray-300 transition-colors"
            onClick={() => setIsOpen(false)}
              aria-label="Закрити фільтри"
          >
            ×
          </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Sorting Section */}
          <div className="border-b border-gray-200 pb-6">
            <button
              onClick={() => toggleSection("sort")}
              className="w-full flex items-center justify-between text-lg font-bold font-['Montserrat'] uppercase tracking-wide text-gray-900 mb-4 hover:text-gray-700 transition-colors"
            >
              <span>СОРТУВАННЯ</span>
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${
                  openSections.sort ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              className={`space-y-3 overflow-hidden transition-all duration-300 ${
                openSections.sort ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="sort"
                  checked={sortOrder === "recommended"}
                  onChange={() => setSortOrder("recommended")}
                  className="w-4 h-4 text-gray-900 focus:ring-gray-900"
                />
                <span className="text-base font-['Montserrat'] text-gray-700 group-hover:text-gray-900">Рекомендовані</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="sort"
                  checked={sortOrder === "newest"}
                  onChange={() => setSortOrder("newest")}
                  className="w-4 h-4 text-gray-900 focus:ring-gray-900"
                />
                <span className="text-base font-['Montserrat'] text-gray-700 group-hover:text-gray-900">За новизною</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="sort"
                  checked={sortOrder === "asc"}
                  onChange={() => setSortOrder("asc")}
                  className="w-4 h-4 text-gray-900 focus:ring-gray-900"
                />
                <span className="text-base font-['Montserrat'] text-gray-700 group-hover:text-gray-900">За зростанням ціни</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="sort"
                  checked={sortOrder === "desc"}
                  onChange={() => setSortOrder("desc")}
                  className="w-4 h-4 text-gray-900 focus:ring-gray-900"
                />
                <span className="text-base font-['Montserrat'] text-gray-700 group-hover:text-gray-900">За спаданням ціни</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="sort"
                  checked={sortOrder === "sale"}
                  onChange={() => setSortOrder("sale")}
                  className="w-4 h-4 text-gray-900 focus:ring-gray-900"
                />
                <span className="text-base font-['Montserrat'] text-gray-700 group-hover:text-gray-900">Спочатку акційні</span>
              </label>
            </div>
          </div>

          {/* Category Section */}
          <div className="border-b border-gray-200 pb-6">
            <button
              onClick={() => toggleSection("category")}
              className="w-full flex items-center justify-between text-lg font-bold font-['Montserrat'] uppercase tracking-wide text-gray-900 mb-4 hover:text-gray-700 transition-colors"
            >
              <span>КАТЕГОРІЯ</span>
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${
                  openSections.category ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              className={`space-y-3 max-h-64 overflow-y-auto transition-all duration-300 ${
                openSections.category ? "opacity-100" : "max-h-0 opacity-0 overflow-hidden"
              }`}
            >
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                    className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 focus:ring-2"
                  />
                  <span className="text-base font-['Montserrat'] text-gray-700 group-hover:text-gray-900">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Section */}
          <div className="border-b border-gray-200 pb-6">
            <button
              onClick={() => toggleSection("price")}
              className="w-full flex items-center justify-between text-lg font-bold font-['Montserrat'] uppercase tracking-wide text-gray-900 mb-4 hover:text-gray-700 transition-colors"
            >
              <span>ВАРТІСТЬ</span>
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${
                  openSections.price ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              className={`space-y-6 overflow-hidden transition-all duration-300 ${
                openSections.price ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {/* Price Range Display */}
              <div className="flex items-center justify-between text-base font-semibold text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                <span className="text-[#8C7461]">{localMinPrice}₴</span>
                <span className="text-gray-400">—</span>
                <span className="text-[#8C7461]">{localMaxPrice}₴</span>
              </div>

              {/* Min Price Slider */}
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-700">
                  Від: <span className="text-[#8C7461] font-semibold">{localMinPrice}₴</span>
                </label>
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={localMinPrice}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value <= localMaxPrice) {
                      handleMinPriceChange(value);
                    }
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                  style={{
                    background: `linear-gradient(to right, #000 0%, #000 ${((localMinPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%, #e5e7eb ${((localMinPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>

              {/* Max Price Slider */}
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-700">
                  До: <span className="text-[#8C7461] font-semibold">{localMaxPrice}₴</span>
                </label>
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={localMaxPrice}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value >= localMinPrice) {
                      handleMaxPriceChange(value);
                    }
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                  style={{
                    background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${((localMaxPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%, #000 ${((localMaxPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%, #000 100%)`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Black button */}
        <div className="bg-white border-t border-gray-200 p-6 space-y-3">
          <div className="text-center text-sm text-gray-600">
            Знайдено товарів: <span className="font-bold text-gray-900">{filteredCount}</span>
          </div>
          <button
            onClick={handleApplyFilters}
            className="w-full bg-black text-white py-4 text-lg font-bold font-['Montserrat'] uppercase tracking-wider hover:bg-gray-900 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
          >
            ФІЛЬТРУВАТИ ({filteredCount})
          </button>
        </div>
      </div>
    </div>
  );
}
