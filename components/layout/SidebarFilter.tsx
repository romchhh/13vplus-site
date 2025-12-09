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

interface Color {
  color: string;
  hex?: string;
}

interface SidebarFilterProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openAccordion: number | null;
  setOpenAccordion: React.Dispatch<React.SetStateAction<number | null>>;
  sortOrder: "recommended" | "newest" | "asc" | "desc" | "sale";
  setSortOrder: React.Dispatch<React.SetStateAction<"recommended" | "newest" | "asc" | "desc" | "sale">>;
  selectedSizes: string[];
  setSelectedSizes: React.Dispatch<React.SetStateAction<string[]>>;
  minPrice: number | null;
  maxPrice: number | null;
  setMinPrice: React.Dispatch<React.SetStateAction<number | null>>;
  setMaxPrice: React.Dispatch<React.SetStateAction<number | null>>;
  selectedColors: string[];
  setSelectedColors: React.Dispatch<React.SetStateAction<string[]>>;
  selectedCategories: number[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<number[]>>;
  colors: Color[];
  categories: Category[];
  products: Product[];
  filteredCount: number;
}

export default function SidebarFilter({
  isOpen,
  setIsOpen,
  openAccordion,
  setOpenAccordion,
  sortOrder,
  setSortOrder,
  selectedSizes,
  setSelectedSizes,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  selectedColors,
  setSelectedColors,
  selectedCategories,
  setSelectedCategories,
  colors,
  categories,
  products,
  filteredCount,
}: SidebarFilterProps) {
  const availableSizes = ["O/S", "160 cm", "XXS", "XS", "XS/S", "S", "M", "M/L", "L", "L/XL"];

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

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

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
          <button
            className="text-white text-2xl hover:text-gray-300 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Sorting Section */}
          <div>
            <h3 className="text-lg font-bold font-['Montserrat'] uppercase tracking-wide text-gray-900 mb-4">
              СОРТУВАННЯ
            </h3>
            <div className="space-y-3">
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

          {/* Size Section */}
          <div>
            <h3 className="text-lg font-bold font-['Montserrat'] uppercase tracking-wide text-gray-900 mb-4">
              РОЗМІР
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`px-4 py-2 text-sm font-['Montserrat'] border-2 transition-colors ${
                    selectedSizes.includes(size)
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-900 border-gray-300 hover:border-gray-900"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Section */}
          <div>
            <h3 className="text-lg font-bold font-['Montserrat'] uppercase tracking-wide text-gray-900 mb-4">
              КОЛІР
            </h3>
            <div className="flex flex-wrap gap-3">
              {colors.map((colorItem, index) => {
                const isSelected = selectedColors.includes(colorItem.color);
                return (
                  <button
                    key={index}
                    onClick={() => toggleColor(colorItem.color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      isSelected
                        ? "border-gray-900 scale-110"
                        : "border-gray-300 hover:border-gray-600"
                    }`}
                    style={{
                      backgroundColor: colorItem.hex || "#ccc",
                    }}
                    title={colorItem.color}
                  />
                );
              })}
            </div>
          </div>

          {/* Category Section */}
          <div>
            <h3 className="text-lg font-bold font-['Montserrat'] uppercase tracking-wide text-gray-900 mb-4">
              КАТЕГОРІЯ
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
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
          <div>
            <h3 className="text-lg font-bold font-['Montserrat'] uppercase tracking-wide text-gray-900 mb-4">
              ВАРТІСТЬ
            </h3>
            <div className="space-y-6">
              {/* Price Range Display */}
              <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                <span>{localMinPrice}₴</span>
                <span className="text-gray-400">—</span>
                <span>{localMaxPrice}₴</span>
              </div>

              {/* Min Price Slider */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Від
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
                  className="w-full"
                />
              </div>

              {/* Max Price Slider */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  До
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
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Black button */}
        <div className="bg-white border-t border-gray-200 p-6">
          <button
            onClick={handleApplyFilters}
            className="w-full bg-black text-white py-4 text-lg font-bold font-['Montserrat'] uppercase tracking-wider hover:bg-gray-900 transition-colors"
          >
            ФІЛЬТРУВАТИ ({filteredCount})
          </button>
        </div>
      </div>
    </div>
  );
}
