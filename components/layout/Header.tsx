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
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const isHomePage = pathname === '/';

  // Ensure component is mounted before using scroll state (prevents hydration mismatch)
  useEffect(() => {
    setIsMounted(true);
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);
    };

    // Initial check after mount
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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


  return (
    <>
      <header
        className={`max-w-[1920px] mx-auto fixed top-0 left-1/2 transform -translate-x-1/2 w-full z-50 transition-all duration-300 ${
          isMounted && isHomePage && !isScrolled
            ? "bg-transparent text-white" 
            : "bg-white text-black shadow-md"
        }`}
        onMouseLeave={() => {
          if (!pinnedCatalog) {
            hoverTimeout.current = setTimeout(() => {
              setHoveredCategoryId(null);
            }, 200); // Small delay
          }
        }}
      >
        {/* === WRAPPER: everything inside shares same bg and styles === */}
        <div className={`w-full transition-all duration-300 ${
          isMounted && isHomePage && !isScrolled ? '' : 'shadow-md'
        }`}>
          {/* Top nav */}
          <div className="hidden lg:flex justify-between items-center h-20 px-10">
            <Link href="/">
              <Image
                height={32}
                width={120}
                alt="logo"
                src="/images/13VPLUS BLACK PNG 2.png"
                className="h-8 w-auto"
              />
            </Link>

            <div className="flex items-center gap-10 text-xl font-normal font-['Montserrat']">
              {/* Product Categories shown directly in top nav */}
              {Array.isArray(categories) && categories.map((category) => (
                <div
                  key={category.id}
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
                    className="cursor-pointer whitespace-nowrap hover:text-[#8C7461] text-lg font-normal font-['Montserrat']"
                  >
                    {category.name}
                  </button>

                  {/* Subcategories dropdown */}
                  {hoveredCategoryId === category.id &&
                    subcategories.length > 0 && (
                      <div className={`absolute top-full left-0 mt-2 shadow-md rounded px-4 py-2 flex flex-col min-w-[200px] z-50 ${
                        isMounted && isHomePage && !isScrolled ? 'bg-white/95 backdrop-blur-sm' : 'bg-white'
                      }`}>
                        {subcategories.map((subcat) => (
                          <Link
                            key={subcat.id}
                            href={`/catalog?subcategory=${encodeURIComponent(
                              subcat.name
                            )}`}
                            className="hover:text-[#8C7461] text-base py-1 font-normal font-['Montserrat'] text-black"
                          >
                            {subcat.name}
                          </Link>
                        ))}
                      </div>
                    )}
                </div>
              ))}

              {/* Information dropdown */}
              <div
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
                <span className="cursor-default whitespace-nowrap hover:text-[#8C7461] text-lg font-normal font-['Montserrat']">
                  Інформація
                </span>

                <div
                  className={`absolute top-full left-0 mt-2 shadow-md rounded px-4 py-2 flex flex-col min-w-[200px] z-50 transition-opacity duration-200 ${
                    isMounted && isHomePage && !isScrolled ? 'bg-white/95 backdrop-blur-sm' : 'bg-white'
                  } ${
                    infoMenuOpen
                      ? "opacity-100 pointer-events-auto"
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  <Link
                    href="/#about"
                    className="hover:text-[#8C7461] text-lg py-1 font-normal font-['Montserrat'] text-black"
                  >
                    Про нас
                  </Link>
                  <Link
                    href="/#payment-and-delivery"
                    className="hover:text-[#8C7461] text-lg py-1 font-normal font-['Montserrat'] text-black"
                  >
                    Оплата і доставка
                  </Link>
                  <Link
                    href="/#reviews"
                    className="hover:text-[#8C7461] text-lg py-1 font-normal font-['Montserrat'] text-black"
                  >
                    Відгуки
                  </Link>
                  <Link
                    href="/#contacts"
                    className="hover:text-[#8C7461] text-lg py-1 font-normal font-['Montserrat'] text-black"
                  >
                    Контакти
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-5">
              <button onClick={() => setIsSearchOpen(true)}>
                <Image
                  className="cursor-pointer"
                  height="32"
                  width="32"
                  alt="search icon"
                  src="/images/light-theme/search.svg"
                />
              </button>
              <button
                className="cursor-pointer relative"
                onClick={() => setIsBasketOpen(!isBasketOpen)}
              >
                <Image
                  height="32"
                  width="32"
                  alt="shopping basket"
                  src="/images/light-theme/basket.svg"
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
        <div className={`lg:hidden w-full h-16 relative overflow-hidden px-4 flex items-center justify-between transition-all duration-300 ${
          isSidebarOpen
            ? "bg-white text-black"
            : isMounted && isHomePage && !isScrolled
            ? "bg-transparent text-white"
            : "bg-white text-black"
        }`}>
          <div className="flex gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="relative w-12 h-12 text-3xl flex items-center justify-center"
            >
              {isSidebarOpen ? (
                <span className="text-4xl">×</span>
              ) : (
                <span>☰</span>
              )}
            </button>
          </div>

          <Link href="/">
            <Image
              height="28"
              width="100"
              alt="logo"
              src="/images/13VPLUS BLACK PNG 2.png"
              className="h-7 w-auto"
            />
          </Link>

          <div className="flex gap-4">
            <button onClick={() => setIsSearchOpen(true)}>
              <Image
                height="32"
                width="32"
                alt="search icon"
                src="/images/light-theme/search.svg"
              />
            </button>
            <button
              onClick={() => setIsBasketOpen(!isBasketOpen)}
              className="relative"
            >
              <Image
                height="32"
                width="32"
                alt="shopping basket"
                src="/images/light-theme/basket.svg"
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
