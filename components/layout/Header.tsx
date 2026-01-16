"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAppContext } from "@/lib/GeneralProvider";
import { useBasket } from "@/lib/BasketProvider";
import SidebarBasket from "./SidebarBasket";
import SidebarSearch from "./SidebarSearch";
import SidebarMenu from "./SidebarMenu";

interface Category {
  id: number;
  name: string;
  priority: number;
}

interface Subcategory {
  id: number;
  name: string;
}

export default function Header() {
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    isBasketOpen,
    setIsBasketOpen,
    isSearchOpen,
    setIsSearchOpen,
  } = useAppContext();

  const { items } = useBasket();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const pathname = usePathname();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<number | null>(
    null
  );
  const [infoMenuOpen, setInfoMenuOpen] = useState(false);
  const infoTimeout = useRef<NodeJS.Timeout | null>(null);

  const [pinnedCatalog, setPinnedCatalog] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const categoryRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const infoRef = useRef<HTMLDivElement | null>(null);
  const [categoryLeftPositions, setCategoryLeftPositions] = useState<Map<number, number>>(new Map());
  const [infoLeftPosition, setInfoLeftPosition] = useState<number>(0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        pinnedCatalog &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setPinnedCatalog(false);
        setHoveredCategoryId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pinnedCatalog]);

  useEffect(() => {
    return () => {
      if (infoTimeout.current) clearTimeout(infoTimeout.current);
    };
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        // Ensure data is always an array
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load categories", err);
        setCategories([]); // Set empty array on error
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchSubcategories(categoryId: number) {
      try {
        const res = await fetch(
          `/api/subcategories?parent_category_id=${categoryId}`
        );
        const data = await res.json();
        setSubcategories(data);
      } catch (err) {
        console.error("Failed to load subcategories", err);
        setSubcategories([]);
      }
    }

    if (hoveredCategoryId !== null) {
      fetchSubcategories(hoveredCategoryId);
    }
  }, [hoveredCategoryId]);

  // Calculate positions for dropdown alignment
  useEffect(() => {
    const updatePositions = () => {
      // Find the header container
      const headerContainer = document.querySelector('.max-w-\\[1920px\\]');
      if (!headerContainer) return;
      
      const containerRect = headerContainer.getBoundingClientRect();
      const containerPadding = 40; // px-10 = 40px

      // Update category positions
      const newPositions = new Map<number, number>();
      categoryRefs.current.forEach((element, categoryId) => {
        if (element) {
          const rect = element.getBoundingClientRect();
          const leftOffset = rect.left - containerRect.left - containerPadding;
          newPositions.set(categoryId, Math.max(0, leftOffset));
        }
      });
      setCategoryLeftPositions(newPositions);

      // Update info position
      if (infoRef.current) {
        const rect = infoRef.current.getBoundingClientRect();
        const leftOffset = rect.left - containerRect.left - containerPadding;
        setInfoLeftPosition(Math.max(0, leftOffset));
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(updatePositions, 100);
    window.addEventListener('resize', updatePositions);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updatePositions);
    };
  }, [categories, hoveredCategoryId, infoMenuOpen]);


  return (
    <>
      <header
        className="max-w-[1920px] mx-auto fixed top-0 left-1/2 transform -translate-x-1/2 w-full z-50 bg-black text-white shadow-md transition-all duration-300"
        onMouseLeave={() => {
          if (!pinnedCatalog) {
            hoverTimeout.current = setTimeout(() => {
              setHoveredCategoryId(null);
            }, 200); // Small delay
          }
        }}
      >
        {/* === WRAPPER: everything inside shares same bg and styles === */}
        <div className="w-full transition-all duration-300 shadow-md">
          {/* Top nav */}
          <div className="hidden lg:flex justify-between items-center h-16 px-10">
            <Link href="/" className="flex items-center pt-1">
              <Image
                height={20}
                width={75}
                alt="logo"
                src="/images/dark-theme/13vplus-logo-header-white.png"
                className="h-5 w-auto"
              />
            </Link>

            <div className="flex items-center gap-4 text-xs font-bold font-['Montserrat']">
              {/* Product Categories shown directly in top nav */}
              {Array.isArray(categories) && categories.map((category) => (
                <div
                  key={category.id}
                  ref={(el) => {
                    if (el) {
                      categoryRefs.current.set(category.id, el);
                    } else {
                      categoryRefs.current.delete(category.id);
                    }
                  }}
                  className="relative group"
                  onMouseEnter={() => {
                    if (hoverTimeout.current)
                      clearTimeout(hoverTimeout.current);
                    setHoveredCategoryId(category.id);
                  }}
                  onMouseLeave={() => {
                    if (!pinnedCatalog) {
                      hoverTimeout.current = setTimeout(() => {
                        setHoveredCategoryId(null);
                      }, 200);
                    }
                  }}
                >
                  <button
                    onClick={() =>
                      (window.location.href = `/catalog?category=${encodeURIComponent(
                        category.name
                      )}`)
                    }
                    className="cursor-pointer whitespace-nowrap text-xs font-bold font-['Montserrat'] text-white hover:bg-white hover:text-black hover:px-3 hover:py-1.5 hover:rounded-full transition-all duration-200"
                  >
                    {category.name}
                  </button>

                  {/* Subcategories dropdown */}
                  {hoveredCategoryId === category.id &&
                    subcategories.length > 0 && (
                      <div
                        className="fixed top-16 left-0 w-full bg-white shadow-md px-4 py-4 z-50 transition-opacity duration-200 opacity-100 pointer-events-auto"
                      >
                        <div className="max-w-[1920px] mx-auto w-full flex flex-col gap-1" style={{ paddingLeft: `${categoryLeftPositions.get(category.id) || 0}px` }}>
                        {subcategories.map((subcat) => (
                          <Link
                            key={subcat.id}
                            href={`/catalog?subcategory=${encodeURIComponent(
                              subcat.name
                            )}`}
                              className="text-gray-600 hover:text-black text-xs py-2 font-bold font-['Montserrat'] transition-colors duration-200"
                          >
                            {subcat.name}
                          </Link>
                        ))}
                          <Link
                            href={`/catalog?category=${encodeURIComponent(category.name)}`}
                            className="text-gray-600 hover:text-black text-xs py-2 font-bold font-['Montserrat'] transition-colors duration-200 underline mt-2"
                          >
                            Переглянути всі
                          </Link>
                        </div>
                      </div>
                    )}
                </div>
              ))}

              {/* Information dropdown */}
              <div
                ref={infoRef}
                className="relative"
                onMouseEnter={() => {
                  if (infoTimeout.current) clearTimeout(infoTimeout.current);
                  setInfoMenuOpen(true);
                }}
                onMouseLeave={() => {
                  infoTimeout.current = setTimeout(() => {
                    setInfoMenuOpen(false);
                  }, 200); // delay in ms
                }}
              >
                <span className={`cursor-default whitespace-nowrap text-xs font-bold font-['Montserrat'] text-white hover:bg-white hover:text-black hover:px-3 hover:py-1.5 hover:rounded-full transition-all duration-200 ${
                  infoMenuOpen ? "bg-white text-black rounded-full px-3 py-1.5" : ""
                }`}>
                  ІНФО
                </span>

                <div
                  className={`fixed top-16 left-0 w-full bg-white shadow-md px-4 py-2 z-50 transition-opacity duration-200 ${
                    infoMenuOpen
                      ? "opacity-100 pointer-events-auto"
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="max-w-[1920px] mx-auto w-full flex flex-col gap-1" style={{ paddingLeft: `${infoLeftPosition}px` }}>
                    <Link
                      href="/#about"
                      className="text-gray-600 hover:text-black text-xs py-2 font-bold font-['Montserrat'] transition-colors duration-200"
                    >
                      Про нас
                    </Link>
                    <Link
                      href="/#contacts"
                      className="text-gray-600 hover:text-black text-xs py-2 font-bold font-['Montserrat'] transition-colors duration-200"
                    >
                      Контакти
                    </Link>
                    <Link
                      href="/#payment-and-delivery"
                      className="text-gray-600 hover:text-black text-xs py-2 font-bold font-['Montserrat'] transition-colors duration-200"
                    >
                      Доставка
                    </Link>
                    <Link
                      href="/#payment-and-delivery"
                      className="text-gray-600 hover:text-black text-xs py-2 font-bold font-['Montserrat'] transition-colors duration-200"
                    >
                      Оплата
                    </Link>
                    <Link
                      href="/#reviews"
                      className="text-gray-600 hover:text-black text-xs py-2 font-bold font-['Montserrat'] transition-colors duration-200"
                    >
                      Повернення та обмін
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSearchOpen(true)} className="flex items-center">
                <Image
                  className="cursor-pointer brightness-0 invert"
                  height="24"
                  width="24"
                  alt="search icon"
                  src="/images/dark-theme/search.svg"
                />
              </button>
              <button
                className="cursor-pointer relative flex items-center"
                onClick={() => setIsBasketOpen(!isBasketOpen)}
              >
                <Image
                  className="brightness-0 invert"
                  height="30"
                  width="30"
                  alt="shopping basket"
                  src="/images/light-theme/cart.svg"
                />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden w-full h-14 relative overflow-hidden px-4 flex items-center justify-between bg-black text-white shadow-md transition-all duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="relative w-8 h-8 flex items-center justify-center text-white"
            >
              {isSidebarOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
            <Link 
              href="/" 
              className="flex items-center pt-0.5"
              onClick={(e) => {
                if (isSidebarOpen) {
                  e.preventDefault();
                  setIsSidebarOpen(false);
                  // Scroll to hero after menu closes
                  setTimeout(() => {
                    const heroElement = document.getElementById("hero");
                    if (heroElement) {
                      heroElement.scrollIntoView({ behavior: "smooth" });
                    }
                  }, 300);
                }
              }}
            >
              <Image
                height="18"
                width="65"
                alt="logo"
                src="/images/dark-theme/13vplus-logo-header-white.png"
                className="h-[18px] w-auto"
              />
            </Link>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button onClick={() => setIsSearchOpen(true)} className="flex items-center">
              <Image
                height="22"
                width="22"
                alt="search icon"
                src="/images/dark-theme/search.svg"
                className="brightness-0 invert"
              />
            </button>
            <button
              onClick={() => setIsBasketOpen(!isBasketOpen)}
              className="relative flex items-center"
            >
              <Image
                height="28"
                width="28"
                alt="shopping basket"
                src="/images/light-theme/cart.svg"
                className="brightness-0 invert"
              />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <SidebarMenu
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <SidebarBasket
        isOpen={isBasketOpen}
        setIsOpen={setIsBasketOpen}
      />
      <SidebarSearch
        isOpen={isSearchOpen}
        setIsOpen={setIsSearchOpen}
      />
    </>
  );
}
