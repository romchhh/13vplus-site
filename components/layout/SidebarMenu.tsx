"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCategories } from "@/lib/CategoriesProvider";

interface SidebarMenuProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SidebarMenu({
  isOpen,
  setIsOpen,
}: SidebarMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  // Use categories from context instead of fetching
  const { categories, subcategories: subcategoriesMap, loading, error, fetchSubcategoriesForCategory } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  // Avoid hydration mismatch: server and initial client render show placeholder; real content after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, anchor: string) => {
    e.preventDefault();
    setIsOpen(false);
    if (pathname === "/") {
      // Якщо вже на головній сторінці, просто прокручуємо до якоря
      setTimeout(() => {
        const element = document.getElementById(anchor.replace("#", ""));
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      // Якщо на іншій сторінці, переходимо на головну з якорем
      router.push(`/${anchor}`);
      // Після переходу прокручуємо до якоря
      setTimeout(() => {
        const element = document.getElementById(anchor.replace("#", ""));
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 200);
    }
  };

  // Convert Map to array for selected category
  const selectedSubcategories = selectedCategoryId 
    ? subcategoriesMap.get(selectedCategoryId) || [] 
    : [];

  // Load subcategories when category is selected
  const handleCategorySelect = async (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    
    // If subcategories not loaded yet, fetch them
    if (!subcategoriesMap.has(categoryId)) {
      setLoadingSubcategories(true);
      await fetchSubcategoriesForCategory(categoryId);
      setLoadingSubcategories(false);
    }
  };

  // Select first category by default when categories load
  useEffect(() => {
    if (categories.length > 0 && selectedCategoryId === null) {
      handleCategorySelect(categories[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run when categories/selectedCategoryId change
  }, [categories, selectedCategoryId]);

  // Block scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId);

  return (
    <div className="relative z-50">
      {/* Overlay - only below header */}
      {isOpen && (
        <div
          className="fixed top-[6.5rem] left-0 right-0 bottom-0 bg-black/40 z-30 lg:top-[7.75rem]"
          onClick={() => {
            setIsOpen(false);
          }}
        />
      )}

      {/* Sidebar — below header on mobile (6.5rem) and desktop (7.75rem) */}
      <div
        className={`fixed top-[6.5rem] left-0 h-[calc(100vh-6.5rem)] lg:top-[7.75rem] lg:h-[calc(100vh-7.75rem)] w-full sm:w-4/5 sm:max-w-md bg-white shadow-md z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } overflow-hidden flex flex-col`}
      >
        {/* Categories Scroll - Top */}
        <div className="border-b border-[#3D1A00]/10 bg-white">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex flex-row gap-3 px-4 py-4 min-w-max">
              {!mounted ? (
                <div className="px-4 py-2 text-sm text-[#3D1A00]/60 font-['Montserrat']">Завантаження...</div>
              ) : loading ? (
                <div className="px-4 py-2 text-sm text-[#3D1A00]/60 font-['Montserrat']">Завантаження...</div>
              ) : error ? (
                <div className="px-4 py-2 text-sm text-red-500 font-['Montserrat']">Помилка: {error}</div>
              ) : (
                categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`px-5 py-3 rounded-full text-base font-semibold whitespace-nowrap transition-all duration-200 font-['Montserrat'] ${
                      selectedCategoryId === cat.id
                        ? "bg-[#3D1A00] text-white"
                        : "bg-[#3D1A00]/10 text-[#3D1A00] hover:bg-[#3D1A00]/20"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Subcategories */}
          {selectedCategory && (
            <div className="px-6 pt-6 pb-2">
              {loadingSubcategories ? (
                <div className="py-4 text-center text-sm text-[#3D1A00]/60 font-['Montserrat']">
                  Завантаження...
                </div>
              ) : selectedSubcategories.length > 0 ? (
                <>
                  <div className="space-y-1">
                    {selectedSubcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/catalog?subcategory=${encodeURIComponent(sub.name)}`}
                        className="block py-3 text-base text-[#3D1A00] hover:text-[#3D1A00]/70 transition-colors border-b border-[#3D1A00]/5 font-['Montserrat']"
                        onClick={() => setIsOpen(false)}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                  <div className="pt-4 pb-0 mt-2 border-t border-[#3D1A00]/10">
                    <Link
                      href="/catalog"
                      className="text-base text-[#3D1A00] hover:text-[#3D1A00]/70 transition-colors font-medium font-['Montserrat']"
                      onClick={() => setIsOpen(false)}
                    >
                      Подивитися все
                    </Link>
                  </div>
                </>
              ) : (
                <div className="pt-2 pb-2">
                  <Link
                    href="/catalog"
                    className="text-base text-[#3D1A00] hover:text-[#3D1A00]/70 transition-colors font-medium font-['Montserrat']"
                    onClick={() => setIsOpen(false)}
                  >
                    Подивитися все
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Divider */}
          {selectedCategory && (
            <div className="px-6 py-4">
              <div className="border-t border-[#3D1A00]/10"></div>
            </div>
          )}

          {/* Information Section */}
          <div className="px-6 py-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#3D1A00]/60 mb-4 font-['Montserrat']">
              ІНФОРМАЦІЯ
            </h3>
            <nav className="space-y-1">
              <Link
                href="/info#about"
                className="block py-2 text-base text-[#3D1A00] hover:text-[#3D1A00]/70 transition-colors font-['Montserrat']"
                onClick={() => setIsOpen(false)}
              >
                ПРО БРЕНД
              </Link>
              <Link
                href="/info#partnership"
                className="block py-2 text-base text-[#3D1A00] hover:text-[#3D1A00]/70 transition-colors font-['Montserrat']"
                onClick={() => setIsOpen(false)}
              >
                ПАРТНЕРСТВО
              </Link>
              <Link
                href="/info#delivery"
                className="block py-2 text-base text-[#3D1A00] hover:text-[#3D1A00]/70 transition-colors font-['Montserrat']"
                onClick={() => setIsOpen(false)}
              >
                ДОСТАВКА ТА ОПЛАТА
              </Link>
              <Link
                href="/info#faq"
                className="block py-2 text-base text-[#3D1A00] hover:text-[#3D1A00]/70 transition-colors font-['Montserrat']"
                onClick={() => setIsOpen(false)}
              >
                FAQ
              </Link>
              <Link
                href="/contacts"
                className="block py-2 text-base text-[#3D1A00] hover:text-[#3D1A00]/70 transition-colors font-['Montserrat']"
                onClick={() => setIsOpen(false)}
              >
                КОНТАКТИ
              </Link>
            </nav>
          </div>

        </div>

        {/* Social Media Section - Fixed at bottom */}
        <div className="border-t border-[#3D1A00]/10 bg-white">
          <div className="px-6 py-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#3D1A00]/60 mb-4 font-['Montserrat']">
              ЗВ&apos;ЯЗОК
            </h3>
            <div className="flex flex-row gap-4 flex-wrap">
              <Link
                href="https://www.instagram.com/my_choice_mari"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-base text-[#3D1A00] hover:text-[#3D1A00]/70 transition-colors font-['Montserrat']"
              >
                <Image
                  src="/images/instagram-icon.svg"
                  alt="Instagram"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
                <span>Instagram</span>
              </Link>
              <Link
                href="https://t.me/my_choice_mari"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-base text-[#3D1A00] hover:text-[#3D1A00]/70 transition-colors font-['Montserrat']"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-label="Telegram"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.559z"/>
                </svg>
                <span>Telegram</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
