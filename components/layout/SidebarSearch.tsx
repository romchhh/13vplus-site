"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import { getProductImageSrc } from "@/lib/getFirstProductImage";
import { useProducts } from "@/lib/useProducts";

interface SearchSidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Product {
  id: number;
  name: string;
  price: number;
  first_media?: { type: string; url: string } | null;
}

export default function SearchSidebar({
  isOpen,
  setIsOpen,
}: SearchSidebarProps) {
  const [query, setQuery] = useState("");
  const { products: allProducts, loading } = useProducts();
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(false);

  // Fetch popular products when sidebar opens
  useEffect(() => {
    if (isOpen && !query) {
      async function fetchPopularProducts() {
        try {
          setLoadingPopular(true);
          const response = await fetch("/api/products/top-sale");
          if (response.ok) {
            const data = await response.json();
            // Limit to 6-8 products
            setPopularProducts(data.slice(0, 8));
          }
        } catch (error) {
          console.error("Error fetching popular products:", error);
        } finally {
          setLoadingPopular(false);
        }
      }
      fetchPopularProducts();
    }
  }, [isOpen, query]);

  const filteredProducts = useMemo(
    () =>
      allProducts.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase())
      ),
    [allProducts, query]
  );

  return (
    <div className="relative z-50">
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-4/5 sm:max-w-md bg-stone-100 shadow-md z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } overflow-y-auto`}
      >
        <div className="flex flex-col p-4 sm:p-6 space-y-6 text-base sm:text-lg">
          {/* Header */}
          <div className="flex justify-between items-center text-xl sm:text-2xl font-semibold">
            <span>Пошук</span>
            <button
              className="hover:text-[#8C7461] text-2xl"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          {/* Search Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Введіть запит..."
            className="p-3 border text-lg rounded w-full focus:outline-none bg-white text-black border-stone-300 placeholder-stone-500"
          />

          {/* Search Results */}
          <div className="mt-4">
            {loading && <p className="text-neutral-500">Завантаження...</p>}

            {!loading && query && filteredProducts.length === 0 && (
              <p className="text-neutral-500">Нічого не знайдено.</p>
            )}

            {!loading && query && filteredProducts.length > 0 && (
              <ul className="flex flex-col gap-4">
                {filteredProducts.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/product/${product.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-4 p-2 rounded hover:bg-opacity-80 transition hover:bg-stone-200"
                    >
                      <Image
                        src={getProductImageSrc(product.first_media, "https://placehold.co/64x64")}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded border"
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-sm text-gray-500">
                          {product.price} ₴
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {!query && !loading && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3 text-black">
                    Люди часто цікавляться
                  </h3>
                  {loadingPopular ? (
                    <p className="text-neutral-500">Завантаження...</p>
                  ) : popularProducts.length > 0 ? (
                    <ul className="flex flex-col gap-4">
                      {popularProducts.map((product) => (
                        <li key={product.id}>
                          <Link
                            href={`/product/${product.id}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-4 p-2 rounded hover:bg-opacity-80 transition hover:bg-stone-200"
                          >
                            <Image
                              src={getProductImageSrc(product.first_media, "https://placehold.co/64x64")}
                              alt={product.name}
                              width={64}
                              height={64}
                              className="w-16 h-16 object-cover rounded border"
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{product.name}</span>
                              <span className="text-sm text-gray-500">
                                {product.price} ₴
                              </span>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-neutral-500">
                      Введіть запит для пошуку товарів.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
