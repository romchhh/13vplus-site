"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useAppContext } from "@/lib/GeneralProvider";
import { useBasket } from "@/lib/BasketProvider";
import { useWishlist } from "@/lib/WishlistProvider";
import { useCategories } from "@/lib/CategoriesProvider";
import SidebarBasket from "./SidebarBasket";
import SidebarSearch from "./SidebarSearch";
import SidebarMenu from "./SidebarMenu";
import LoginModal from "@/components/auth/LoginModal";

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

  const { data: session } = useSession();
  const { items } = useBasket();
  const { wishlist, setWishlist } = useWishlist();
  const wishlistRef = useRef(wishlist);
  wishlistRef.current = wishlist;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    if (!session?.user?.email) return;
    const localIds = wishlistRef.current;
    fetch("/api/users/wishlist")
      .then((res) => (res.ok ? res.json() : { productIds: [] }))
      .then(async (data) => {
        const serverIds = Array.isArray(data?.productIds) ? data.productIds : [];
        const toAdd = localIds.filter((id: number) => !serverIds.includes(id));
        for (const productId of toAdd) {
          try {
            await fetch("/api/users/wishlist", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId }),
            });
          } catch {
            // ignore
          }
        }
        if (toAdd.length > 0) {
          const res2 = await fetch("/api/users/wishlist");
          const data2 = res2.ok ? await res2.json() : { productIds: serverIds };
          const ids = Array.isArray(data2?.productIds) ? data2.productIds : serverIds;
          setWishlist(ids);
        } else {
          setWishlist(serverIds);
        }
      })
      .catch(() => {});
    // Тільки при зміні сесії (вхід/вихід), не при кожному рендері
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email]);
  
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
                src="/images/tg_image_3614117882.png"
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
                      (window.location.href = `/catalog/${encodeURIComponent(
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
                            href={`/catalog/${encodeURIComponent(category.name)}`}
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
                      href="/info"
                      className="text-gray-600 hover:text-black text-xs py-2 font-bold font-['Montserrat'] transition-colors duration-200"
                    >
                      Доставка
                    </Link>
                    <Link
                      href="/info"
                      className="text-gray-600 hover:text-black text-xs py-2 font-bold font-['Montserrat'] transition-colors duration-200"
                    >
                      Оплата
                    </Link>
                    <Link
                      href="/info#obmin-povernennya"
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
              <button 
                onClick={() => setIsSearchOpen(true)} 
                className="flex items-center bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-full px-4 py-2 transition-colors"
              >
                <Image
                  className="cursor-pointer brightness-0 invert h-5 w-5 mr-2"
                  height="20"
                  width="20"
                  alt="search icon"
                  src="/images/dark-theme/search.svg"
                />
                <span className="text-white text-sm font-['Montserrat']">Пошук</span>
              </button>

              {session ? (
                <Link href="/profile?tab=wishlist" className="relative flex items-center" title="Вішлист">
                  <svg
                    className="w-5 h-5 text-white cursor-pointer"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                  {wishlist.length > 0 && (
                    <span className="absolute -bottom-0.5 -right-1 text-white text-xs font-['Montserrat'] font-medium">
                      {wishlist.length > 99 ? "99+" : wishlist.length}
                    </span>
                  )}
                </Link>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="relative flex items-center"
                  title="Вішлист (увійдіть)"
                >
                  <svg
                    className="w-5 h-5 text-white cursor-pointer"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                  {wishlist.length > 0 && (
                    <span className="absolute -bottom-0.5 -right-1 text-white text-xs font-['Montserrat'] font-medium">
                      {wishlist.length > 99 ? "99+" : wishlist.length}
                    </span>
                  )}
                </button>
              )}
              
              {/* Profile Icon */}
              {session ? (
                <Link href="/profile" className="flex items-center relative">
                  <div className="relative">
                    <svg
                      className="w-5 h-5 text-white cursor-pointer"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border-2 border-black rounded-full"></span>
                  </div>
                </Link>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center"
                >
                  <svg
                    className="w-5 h-5 text-white cursor-pointer"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>
              )}
              
              <button
                className="cursor-pointer relative flex items-center"
                onClick={() => setIsBasketOpen(!isBasketOpen)}
              >
                <Image
                  className="brightness-0 invert h-5 w-5"
                  height="20"
                  width="20"
                  alt="shopping basket"
                  src="/images/light-theme/cart.svg"
                />
                {totalItems > 0 && (
                  <span className="absolute -bottom-0.5 -right-1 text-white text-xs font-['Montserrat'] font-medium">
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
              className="relative w-7 h-7 flex items-center justify-center text-white"
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
                height="18"
                width="65"
                alt="logo"
                src="/images/tg_image_3614117882.png"
                className="h-[18px] w-auto"
              />
            </Link>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button 
              onClick={() => setIsSearchOpen(true)} 
              className="flex items-center bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-full px-3 py-1.5 transition-colors"
            >
              <Image
                height="18"
                width="18"
                alt="search icon"
                src="/images/dark-theme/search.svg"
                className="brightness-0 invert h-[18px] w-[18px] mr-1.5"
              />
              <span className="text-white text-xs font-['Montserrat']">Пошук</span>
            </button>
            {session ? (
              <Link href="/profile?tab=wishlist" className="relative flex items-center" title="Вішлист">
                <svg
                  className="w-5 h-5 text-white cursor-pointer"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                {wishlist.length > 0 && (
                  <span className="absolute -bottom-0.5 -right-1 text-white text-xs font-['Montserrat'] font-medium">
                    {wishlist.length > 99 ? "99+" : wishlist.length}
                  </span>
                )}
              </Link>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="relative flex items-center"
                title="Вішлист (увійдіть)"
              >
                <svg
                  className="w-5 h-5 text-white cursor-pointer"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                {wishlist.length > 0 && (
                  <span className="absolute -bottom-0.5 -right-1 text-white text-xs font-['Montserrat'] font-medium">
                    {wishlist.length > 99 ? "99+" : wishlist.length}
                  </span>
                )}
              </button>
            )}
            
            {/* Profile Icon Mobile */}
            {session ? (
              <Link href="/profile" className="flex items-center relative">
                <div className="relative">
                  <svg
                    className="w-5 h-5 text-white cursor-pointer"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 border-2 border-black rounded-full"></span>
                </div>
              </Link>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center"
              >
                <svg
                  className="w-5 h-5 text-white cursor-pointer"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>
            )}
            
            <button
              onClick={() => setIsBasketOpen(!isBasketOpen)}
              className="relative flex items-center"
            >
              <Image
                height="20"
                width="20"
                alt="shopping basket"
                src="/images/light-theme/cart.svg"
                className="brightness-0 invert h-5 w-5"
              />
              {totalItems > 0 && (
                <span className="absolute -bottom-0.5 -right-1 text-white text-xs font-['Montserrat'] font-medium">
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
      
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
