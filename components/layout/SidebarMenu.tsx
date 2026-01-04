"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface SidebarMenuProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Category {
  id: number;
  name: string;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: number;
  name: string;
}

export default function SidebarMenu({
  isOpen,
  setIsOpen,
}: SidebarMenuProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openCategoryId, setOpenCategoryId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data: Category[] = await res.json();

        // Fetch subcategories for each category
        const categoriesWithSubcats = await Promise.all(
          data.map(async (cat) => {
            try {
              const subRes = await fetch(
                `/api/subcategories?parent_category_id=${cat.id}`
              );
              const subData: Subcategory[] = await subRes.json();
              return { ...cat, subcategories: subData };
            } catch {
              return { ...cat, subcategories: [] };
            }
          })
        );

        setCategories(categoriesWithSubcats);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <div className="relative z-50">
      {/* Overlay - only below header */}
      {isOpen && (
        <div
          className="fixed top-14 left-0 right-0 bottom-0 bg-black/40 z-30"
          onClick={() => {
            setIsOpen(false);
          }}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-full sm:w-4/5 sm:max-w-md bg-black shadow-md z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } overflow-y-auto flex flex-col`}
      >
        <nav className="flex flex-col px-6 pt-8 pb-6 space-y-4 flex-grow">
          {loading && <p className="text-lg text-white">Завантаження...</p>}
          {error && <p className="text-red-500 text-lg">Помилка: {error}</p>}

          {!loading &&
            !error &&
            categories.map((cat) => (
              <div key={cat.id} className="flex flex-col">
                <div className="flex justify-between items-center">
                  <Link
                    href={`/catalog?category=${encodeURIComponent(cat.name)}`}
                    className="text-2xl sm:text-3xl font-medium text-white hover:text-white/70 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {cat.name}
                  </Link>

                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <button
                      className="ml-4 text-2xl sm:text-3xl font-bold text-white/60 hover:text-white transition-all duration-300"
                      onClick={() =>
                        setOpenCategoryId(
                          openCategoryId === cat.id ? null : cat.id
                        )
                      }
                    >
                      <svg
                        className={`w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 ${
                          openCategoryId === cat.id ? "rotate-180" : ""
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
                  )}
                </div>

                {/* Subcategories dropdown */}
                {openCategoryId === cat.id && cat.subcategories && (
                  <div className="flex flex-col pl-4 mt-2 space-y-2">
                    {cat.subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/catalog?subcategory=${encodeURIComponent(
                          sub.name
                        )}`}
                        className="text-xl sm:text-2xl text-white/70 hover:text-white transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </nav>

        {/* Bottom section with Instagram and contacts */}
        <div className="mt-auto px-6 py-6 border-t border-white/10">
          <div className="flex flex-col gap-4">
            <Link
              href="https://www.instagram.com/13vplus"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-lg font-medium text-white hover:text-white/70 transition-colors"
            >
              <Image
                src="/images/instagram-icon.svg"
                alt="Instagram"
                width={24}
                height={24}
                className="w-6 h-6 brightness-0 invert"
              />
              <span>Instagram</span>
            </Link>
            <Link
              href="/#contacts"
              className="text-lg font-medium text-white hover:text-white/70 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Контакти
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
