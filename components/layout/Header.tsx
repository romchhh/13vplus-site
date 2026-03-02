"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppContext } from "@/lib/GeneralProvider";
import { useBasket } from "@/lib/BasketProvider";
import { useCategories } from "@/lib/CategoriesProvider";
import SidebarBasket from "./SidebarBasket";
import SidebarSearch from "./SidebarSearch";
import SidebarMenu from "./SidebarMenu";

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

  const router = useRouter();
  const pathname = usePathname();
  const { items } = useBasket();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, anchor: string) => {
    e.preventDefault();
    if (pathname === "/") {
      // Якщо вже на головній сторінці, просто прокручуємо до якоря
      const element = document.getElementById(anchor.replace("#", ""));
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      // Якщо на іншій сторінці, переходимо на головну з якорем
      router.push(`/${anchor}`);
      // Після переходу прокручуємо до якоря
      setTimeout(() => {
        const element = document.getElementById(anchor.replace("#", ""));
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  // Use categories from context instead of fetching
  const { categories } = useCategories();
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
  const [isScrolled, setIsScrolled] = useState(false);

  const isHeroMode = pathname === "/" && !isScrolled;
  // Коли бургер відкритий — хедер завжди білий (навіть якщо був прозорий)
  const headerTransparent = isHeroMode && !isSidebarOpen;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // init
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  // Categories are now loaded from context, no need to fetch

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
        className={`max-w-[1920px] mx-auto fixed top-0 left-1/2 transform -translate-x-1/2 w-full z-50 transition-all duration-300 ${
          headerTransparent ? "bg-transparent text-white shadow-none" : "bg-white text-[#3D1A00] shadow-md"
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
        <div className={`w-full transition-all duration-300 ${headerTransparent ? "shadow-none" : "shadow-md"}`}>
          {/* Top info bar — роздільна лінія тільки в межах контенту (не на весь екран) */}
          <div className={`hidden lg:flex justify-center transition-colors ${headerTransparent ? "bg-[#FFF9F0]" : "bg-[#D7D799]"}`}>
            <div className="w-full max-w-[1920px] mx-auto px-10 flex justify-between items-center h-11 text-xs font-['Montserrat'] text-[#3D1A00] border-b border-[#3D1A00]/20">
              <span>Офіційний представник бренду Choice в Україні</span>
              <div className="flex items-center gap-4">
                <Link href="/contacts" className="hover:opacity-80 transition-colors">Зв&apos;язатися з Choice</Link>
                <a href="https://www.instagram.com/my_choice_mari" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-colors">Instagram</a>
                <a href="https://t.me/my_choice_mari" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-colors">Telegram</a>
              </div>
            </div>
          </div>
          {/* Top info bar — mobile */}
          <div className={`lg:hidden flex justify-center transition-colors ${headerTransparent ? "bg-[#FFF9F0]" : "bg-[#D7D799]"}`}>
            <div className="w-full max-w-[1920px] mx-auto flex justify-between items-center min-h-10 py-2.5 px-3 sm:px-4 text-[10px] sm:text-xs font-['Montserrat'] text-[#3D1A00] border-b border-[#3D1A00]/20">
              <span className="truncate mr-2 max-w-[55%] sm:max-w-none">Офіційний представник бренду Choice в Україні</span>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <Link href="/contacts" className="hover:opacity-80 transition-colors whitespace-nowrap">Зв&apos;язатися з Choice</Link>
                <a href="https://www.instagram.com/my_choice_mari" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-colors whitespace-nowrap">Instagram</a>
                <a href="https://t.me/my_choice_mari" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-colors whitespace-nowrap">Telegram</a>
              </div>
            </div>
          </div>
          {/* Top nav — трохи вищий */}
          <div className="hidden lg:flex justify-center">
            <div className="w-full max-w-[1920px] mx-auto flex justify-between items-center h-20 px-10">
            <Link href="/" className="flex items-center pt-1">
              <Image
                src={headerTransparent ? "/images/logos/choice-logo-white.png" : "/images/logos/choice-logo-dark.png"}
                alt="Choice"
                width={120}
                height={32}
                className="h-8 w-auto"
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
                      (window.location.href = `/catalog/${category.slug || encodeURIComponent(category.name)}`)
                    }
                    className={`cursor-pointer whitespace-nowrap text-xs font-bold font-['Montserrat'] hover:px-3 hover:py-1.5 hover:rounded-full transition-all duration-200 ${
                      headerTransparent ? "text-white hover:bg-white hover:text-[#3D1A00]" : "text-[#3D1A00] hover:bg-[#3D1A00] hover:text-white"
                    }`}
                  >
                    {category.name}
                  </button>

                  {/* Subcategories dropdown */}
                  {hoveredCategoryId === category.id &&
                    subcategories.length > 0 && (
                      <div
                        className="fixed top-[7.75rem] left-0 w-full bg-white shadow-md px-4 py-4 z-50 transition-opacity duration-200 opacity-100 pointer-events-auto"
                      >
                        <div className="max-w-[1920px] mx-auto w-full flex flex-col gap-1" style={{ paddingLeft: `${categoryLeftPositions.get(category.id) || 0}px` }}>
                        {subcategories.map((subcat) => (
                          <Link
                            key={subcat.id}
                            href={`/catalog?subcategory=${encodeURIComponent(
                              subcat.name
                            )}`}
                              className="text-gray-600 hover:text-[#3D1A00] text-xs py-2 font-bold font-['Montserrat'] transition-colors duration-200"
                          >
                            {subcat.name}
                          </Link>
                        ))}
                          <Link
                            href={`/catalog/${category.slug || encodeURIComponent(category.name)}`}
                            className="text-gray-600 hover:text-[#3D1A00] text-xs py-2 font-bold font-['Montserrat'] transition-colors duration-200 underline mt-2"
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
                <span className={`cursor-default whitespace-nowrap text-xs font-bold font-['Montserrat'] hover:px-3 hover:py-1.5 hover:rounded-full transition-all duration-200 ${
                  headerTransparent ? "text-white hover:bg-white hover:text-[#3D1A00]" : "text-[#3D1A00] hover:bg-[#3D1A00] hover:text-white"
                } ${infoMenuOpen ? (headerTransparent ? "bg-white text-[#3D1A00] rounded-full px-3 py-1.5" : "bg-[#3D1A00] text-white rounded-full px-3 py-1.5") : ""}`}>
                  ІНФО
                </span>

                <div
                  className={`fixed top-[7.75rem] left-0 w-full bg-white shadow-md px-4 py-2 z-50 transition-opacity duration-200 ${
                    infoMenuOpen
                      ? "opacity-100 pointer-events-auto"
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="max-w-[1920px] mx-auto w-full flex flex-col gap-1" style={{ paddingLeft: `${infoLeftPosition}px` }}>
                    <Link
                      href="/info#about"
                      className="text-gray-600 hover:text-[#3D1A00] text-xs py-2 font-bold font-['Montserrat'] transition-colors duration-200"
                    >
                      Про бренд
                    </Link>
                    <Link
                      href="/info#partnership"
                      className="text-gray-600 hover:text-[#3D1A00] text-xs py-2 font-bold font-['Montserrat'] transition-colors duration-200"
                    >
                      Партнерство
                    </Link>
                    <Link
                      href="/info#delivery"
                      className="text-gray-600 hover:text-[#3D1A00] text-xs py-2 font-bold font-['Montserrat'] transition-colors duration-200"
                    >
                      Доставка та оплата
                    </Link>
                    <Link
                      href="/info#faq"
                      className="text-gray-600 hover:text-[#3D1A00] text-xs py-2 font-bold font-['Montserrat'] transition-colors duration-200"
                    >
                      FAQ
                    </Link>
                    <Link
                      href="/contacts"
                      className="text-gray-600 hover:text-[#3D1A00] text-xs py-2 font-bold font-['Montserrat'] transition-colors duration-200"
                    >
                      Контакти
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSearchOpen(true)} 
                className="flex items-center rounded-full px-4 py-2 transition-colors bg-[#D7D799] hover:opacity-90"
              >
                <Image
                  className="cursor-pointer h-5 w-5 mr-2 brightness-0"
                  height="20"
                  width="20"
                  alt="search icon"
                  src="/images/dark-theme/search.svg"
                  style={{ filter: "brightness(0) saturate(100%) invert(14%) sepia(99%) saturate(2044%) hue-rotate(11deg) brightness(95%) contrast(101%)" }}
                />
                <span className="text-sm font-['Montserrat'] text-[#3D1A00]">Пошук</span>
              </button>

              <button
                className="cursor-pointer relative flex items-center justify-center p-2 min-w-[3rem] min-h-[3rem]"
                onClick={() => setIsBasketOpen(!isBasketOpen)}
              >
                <Image
                  className="h-7 w-7"
                  height="28"
                  width="28"
                  alt="shopping basket"
                  src="/images/light-theme/cart.svg"
                  style={{ filter: headerTransparent ? "brightness(0) invert(1)" : "brightness(0) saturate(100%) invert(14%) sepia(99%) saturate(2044%) hue-rotate(11deg) brightness(95%) contrast(101%)" }}
                />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 min-w-[1.25rem] h-5 px-1 flex items-center justify-center text-white text-sm font-['Montserrat'] font-bold bg-[#8C7461] rounded-full leading-none">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>
            </div>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className={`lg:hidden w-full h-16 relative overflow-hidden px-4 flex items-center justify-between transition-all duration-300 ${
          headerTransparent ? "bg-transparent text-white shadow-none" : "bg-white text-[#3D1A00] shadow-md"
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`relative w-7 h-7 flex items-center justify-center ${headerTransparent ? "text-white" : "text-[#3D1A00]"}`}
            >
              {isSidebarOpen ? (
                <svg
                  className="w-5 h-5"
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
                  className="w-5 h-5"
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
                src={headerTransparent ? "/images/logos/choice-logo-white.png" : "/images/logos/choice-logo-dark.png"}
                alt="Choice"
                width={100}
                height={26}
                className="h-6 w-auto"
              />
            </Link>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button 
              onClick={() => setIsSearchOpen(true)} 
              className="flex items-center rounded-full px-3 py-1.5 transition-colors bg-[#D7D799] hover:opacity-90"
            >
              <Image
                height="18"
                width="18"
                alt="search icon"
                src="/images/dark-theme/search.svg"
                className="h-[18px] w-[18px] mr-1.5 brightness-0"
                style={{ filter: "brightness(0) saturate(100%) invert(14%) sepia(99%) saturate(2044%) hue-rotate(11deg) brightness(95%) contrast(101%)" }}
              />
              <span className="text-xs font-['Montserrat'] text-[#3D1A00]">Пошук</span>
            </button>

            <button
              onClick={() => setIsBasketOpen(!isBasketOpen)}
              className="relative flex items-center justify-center p-2 min-w-[2.75rem] min-h-[2.75rem]"
            >
              <Image
                height="24"
                width="24"
                alt="shopping basket"
                src="/images/light-theme/cart.svg"
                className="h-6 w-6"
                style={{ filter: headerTransparent ? "brightness(0) invert(1)" : "brightness(0) saturate(100%) invert(14%) sepia(99%) saturate(2044%) hue-rotate(11deg) brightness(95%) contrast(101%)" }}
              />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 min-w-[1.125rem] h-4 px-0.5 flex items-center justify-center text-white text-xs font-['Montserrat'] font-bold bg-[#8C7461] rounded-full leading-none">
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
