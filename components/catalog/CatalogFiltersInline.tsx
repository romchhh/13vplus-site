"use client";

import { useMemo, useState, useEffect } from "react";

interface Category {
  id: number;
  name: string;
}

interface CatalogFiltersInlineProps {
  categories: Category[];
  selectedCategories: number[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<number[]>>;
  minPrice: number | null;
  maxPrice: number | null;
  setMinPrice: React.Dispatch<React.SetStateAction<number | null>>;
  setMaxPrice: React.Dispatch<React.SetStateAction<number | null>>;
  priceRange: { min: number; max: number };
  filteredCount: number;
  onApply?: () => void;
  /** На мобільному: згорнутий за замовчуванням, розгортається по кліку */
  defaultOpenOnMobile?: boolean;
}

export default function CatalogFiltersInline({
  categories,
  selectedCategories,
  setSelectedCategories,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  priceRange,
  filteredCount,
  onApply,
  defaultOpenOnMobile = false,
}: CatalogFiltersInlineProps) {
  const [localMin, setLocalMin] = useState<string>(minPrice !== null ? String(minPrice) : "");
  const [localMax, setLocalMax] = useState<string>(maxPrice !== null ? String(maxPrice) : "");
  const [mobileOpen, setMobileOpen] = useState(defaultOpenOnMobile);

  useEffect(() => {
    setLocalMin(minPrice !== null ? String(minPrice) : "");
    setLocalMax(maxPrice !== null ? String(maxPrice) : "");
  }, [minPrice, maxPrice]);

  const hasActiveFilters = useMemo(
    () =>
      selectedCategories.length > 0 ||
      (minPrice !== null && minPrice !== priceRange.min) ||
      (maxPrice !== null && maxPrice !== priceRange.max),
    [selectedCategories.length, minPrice, maxPrice, priceRange]
  );

  const toggleCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    const from = localMin.trim() ? parseInt(localMin, 10) : null;
    const to = localMax.trim() ? parseInt(localMax, 10) : null;
    setMinPrice(from !== null && !isNaN(from) ? from : null);
    setMaxPrice(to !== null && !isNaN(to) ? to : null);
    setMobileOpen(false);
    onApply?.();
  };

  const clearAll = () => {
    setSelectedCategories([]);
    setMinPrice(null);
    setMaxPrice(null);
    setLocalMin("");
    setLocalMax("");
    setMobileOpen(false);
  };

  const filtersContent = (
    <div className="space-y-6">
      {/* ЦІНА */}
      <div>
        <h3 className="text-xs font-bold font-['Montserrat'] uppercase tracking-widest text-gray-700 mb-3">
          Ціна
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-['Montserrat']">Від</span>
            <input
              type="number"
              min={priceRange.min}
              max={priceRange.max}
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
              placeholder="Грн"
              className="w-24 sm:w-28 px-3 py-2.5 bg-[#FFF9F0] border border-[#E8DED0] rounded text-sm font-['Montserrat'] text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#8B9A47]/30 focus:border-[#8B9A47] outline-none transition-shadow"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-['Montserrat']">До</span>
            <input
              type="number"
              min={priceRange.min}
              max={priceRange.max}
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              placeholder="Грн"
              className="w-24 sm:w-28 px-3 py-2.5 bg-[#FFF9F0] border border-[#E8DED0] rounded text-sm font-['Montserrat'] text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#8B9A47]/30 focus:border-[#8B9A47] outline-none transition-shadow"
            />
          </label>
        </div>
      </div>

      {/* КАТЕГОРІЯ ТОВАРУ */}
      <div>
        <h3 className="text-xs font-bold font-['Montserrat'] uppercase tracking-widest text-gray-700 mb-3">
          Категорія товару
        </h3>
        <ul className="space-y-2.5 max-h-64 overflow-y-auto">
          {categories.map((cat) => (
            <li key={cat.id}>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                  className="w-4 h-4 rounded border-gray-300 text-[#8B9A47] focus:ring-[#8B9A47] focus:ring-offset-0"
                />
                <span className="text-sm font-['Montserrat'] text-gray-700 group-hover:text-gray-900">
                  {cat.name}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Кнопки */}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={clearAll}
          className="flex-1 py-2.5 px-4 text-sm font-medium font-['Montserrat'] text-gray-800 bg-white border border-[#C4B59A] hover:bg-gray-50 rounded transition-colors"
        >
          Очистити
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="flex-1 py-2.5 px-4 text-sm font-semibold font-['Montserrat'] text-gray-900 bg-[#8B9A47] hover:bg-[#7a8940] text-white rounded transition-colors shadow-sm"
        >
          Застосувати
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: завжди видимий сайдбар */}
      <aside
        className="hidden lg:block w-56 xl:w-64 flex-shrink-0 bg-[#FFFBF5] rounded-lg p-5 border border-[#E8DED0] shadow-sm"
        aria-label="Фільтри"
      >
        {filtersContent}
      </aside>

      {/* Mobile: кнопка "Фільтри" і згортання вгорі */}
      <div className="lg:hidden w-full">
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="w-full flex items-center justify-between py-3 px-4 bg-[#FFFBF5] rounded-lg border border-[#E8DED0] font-['Montserrat'] font-medium text-gray-800 shadow-sm"
          aria-expanded={mobileOpen}
          aria-controls="catalog-filters-mobile"
        >
          <span>Фільтри</span>
          {hasActiveFilters && (
            <span className="bg-[#8B9A47] text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center">
              {selectedCategories.length + (localMin ? 1 : 0) + (localMax ? 1 : 0)}
            </span>
          )}
          <svg
            className={`w-5 h-5 transition-transform ${mobileOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div
          id="catalog-filters-mobile"
          className={`overflow-hidden transition-all duration-200 ${mobileOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="pt-4 pb-2 px-2 bg-[#FFFBF5] rounded-b-lg border border-t-0 border-[#E8DED0]">
            {filtersContent}
          </div>
        </div>
      </div>
    </>
  );
}
