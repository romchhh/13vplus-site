"use client";

import { useAppContext } from "@/lib/GeneralProvider";
import { useState, useEffect, useRef } from "react";
import { useBasket } from "@/lib/BasketProvider";
import Image from "next/image";
import Alert from "@/components/shared/Alert";
import CartAlert from "@/components/shared/CartAlert";
import { getFirstProductImage } from "@/lib/getFirstProductImage";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";


const SIZE_MAP: Record<string, string> = {
  "1": "XL",
  "2": "L",
  "3": "M",
  "4": "S",
  "5": "XS",
};

interface ProductClientProps {
  product: {
    id: number;
    name: string;
    price: number;
    old_price?: number | null;
    discount_percentage?: number | null;
    description?: string | null;
    media?: { url: string; type: string }[];
    sizes?: { size: string; stock: number }[];
    colors?: { label: string; hex?: string | null }[];
    fabric_composition?: string | null;
    has_lining?: boolean;
    lining_description?: string | null;
  };
}

interface RelatedProduct {
  id: number;
  name: string;
  first_color: { label: string; hex?: string | null } | null;
}

export default function ProductClient({ product: initialProduct }: ProductClientProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const quantity = 1;
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [product, setProduct] = useState(initialProduct);
  const [isLoading, setIsLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  
  // Use basket hook - component is client-side only with 'use client'
  const { addItem } = useBasket();
  const { setIsBasketOpen } = useAppContext();

  const [showCartAlert, setShowCartAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<
    "success" | "error" | "warning" | "info"
  >("info");
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const isAddingToCartRef = useRef(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  // Auto-select first color if available
  useEffect(() => {
    if (product?.colors && product.colors.length > 0 && !selectedColor) {
      setSelectedColor(product.colors[0].label);
    }
  }, [product, selectedColor]);

  // Fetch related products with same name
  useEffect(() => {
    async function fetchRelatedProducts() {
      try {
        const response = await fetch(
          `/api/products/related-colors?name=${encodeURIComponent(product.name)}`
        );
        if (response.ok) {
          const data: RelatedProduct[] = await response.json();
          // Filter out current product
          const filtered = data.filter((p) => p.id !== product.id);
          setRelatedProducts(filtered);
        } else {
          // Silently fail - related products are optional
          console.warn("Could not fetch related products:", response.statusText);
        }
      } catch (error) {
        // Silently fail - related products are optional and shouldn't break the page
        console.warn("Error fetching related products (non-critical):", error);
      }
    }
    
    if (product?.name) {
      fetchRelatedProducts();
    }
  }, [product.name, product.id]);

  // Handle color variant change
  const handleColorVariantChange = async (productId: number) => {
    if (productId === product.id) return;
    
    setIsLoading(true);
    setActiveImageIndex(0);
    
    // Scroll to top on mobile when changing color variant
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (response.ok) {
        const newProduct = await response.json();
        
        // Update URL without reload
        window.history.pushState(null, '', `/product/${productId}`);
        
        // Update product state with smooth transition
        setTimeout(() => {
          setProduct(newProduct);
          setSelectedSize(null); // Reset size selection
          
          // Auto-select first color if available
          if (newProduct.colors && newProduct.colors.length > 0) {
            setSelectedColor(newProduct.colors[0].label);
          } else {
            setSelectedColor(null);
          }
          
          setIsLoading(false);
        }, 100);
      } else {
        console.error("Failed to fetch product:", response.statusText);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    // Prevent double-click using ref for immediate check
    if (isAddingToCartRef.current) {
      return;
    }

    if (!selectedSize) {
      setAlertMessage("Оберіть розмір");
      setAlertType("warning");
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }
    if (product?.colors && product.colors.length > 0 && !selectedColor) {
      setAlertMessage("Оберіть колір");
      setAlertType("warning");
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }
    if (!product) {
      setAlertMessage("Товар не завантажений");
      setAlertType("error");
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }
    if (!addItem) {
      setAlertMessage("Кошик недоступний. Спробуйте оновити сторінку.");
      setAlertType("error");
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }

    isAddingToCartRef.current = true;
    setIsAddingToCart(true);
    try {
      const media = product.media || [];
      await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        size: selectedSize,
        quantity,
        imageUrl: getFirstProductImage(media),
        color: selectedColor || undefined,
        discount_percentage: product.discount_percentage ?? undefined,
      });
      setShowCartAlert(true);
      setTimeout(() => setShowCartAlert(false), 5000);
    } catch (error) {
      setAlertMessage(
        error instanceof Error ? error.message : "Недостатньо товару в наявності"
      );
      setAlertType("error");
      setTimeout(() => setAlertMessage(null), 5000);
    } finally {
      isAddingToCartRef.current = false;
      setIsAddingToCart(false);
    }
  };

  const media = product.media || [];
  const sizes = (product.sizes || [])
    ?.filter((s) => (s.stock ?? 0) > 0)
    .map((s) => s.size) || [
    "xs",
    "s",
    "m",
    "l",
    "xl",
  ];
  const outOfStock = sizes.length === 0;

  const [isMounted, setIsMounted] = useState(false);

  // Avoid SSR hydration flicker
  useEffect(() => setIsMounted(true), []);
  if (!isMounted || !media?.length) return null;

  return (
    <section className="max-w-[1920px] w-full mx-auto bg-white">
      <div className="flex flex-col lg:flex-row gap-0 lg:gap-12 p-0 md:p-10 lg:pt-0 lg:px-16 lg:pb-16 lg:items-start">
        {/* Images Slider - Left Side */}
        <div className="w-screen md:w-full lg:w-1/2 relative h-[100vh] md:h-[70vh] min-h-[400px] lg:h-[calc(100vh-6rem)] mb-6 lg:mb-0 left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] md:left-0 md:right-0 md:ml-0 md:mr-0 -mt-14 md:mt-0 lg:mt-0">
          <Swiper
            modules={[Navigation, Autoplay]}
            onSwiper={setSwiper}
            slidesPerView={1}
            spaceBetween={0}
            onSlideChange={(s) => setActiveImageIndex(s.activeIndex)}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            className="w-full h-full"
          >
            {media.map((item, i) => (
              <SwiperSlide key={i}>
                <div 
                  className="relative w-full h-full bg-white flex items-start justify-center cursor-pointer lg:cursor-default"
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setIsMediaModalOpen(true);
                      setActiveImageIndex(i);
                    }
                  }}
                >
                  {item.type === "video" ? (
                    <video
                      className="object-cover md:object-contain w-full h-full"
                      src={`/api/images/${item.url}`}
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <Image
                      src={`/api/images/${item.url}`}
                      alt={`Product view ${i + 1}`}
                      fill
                      className="object-cover md:object-contain"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
                      priority={i === 0}
                      loading={i <= 1 ? undefined : "lazy"}
                      quality={i === 0 ? 85 : 75}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    />
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Model info text */}
          {selectedSize && (
            <div className="mt-4 text-sm font-['Montserrat'] text-gray-600">
              Зріст моделі 173 см, розмір на ній - {selectedSize}
            </div>
          )}
        </div>

        {/* Info Section - Right Side */}
        <div className="flex flex-col gap-6 w-full lg:w-1/2 px-4 md:px-0">
          {/* Product Name */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-normal font-['Montserrat'] uppercase tracking-wider leading-tight mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <div className="text-2xl md:text-3xl font-bold font-['Montserrat'] tracking-tight">
            {product.discount_percentage ? (
              <div className="flex items-center gap-3">
                <span className="text-gray-900 line-through text-2xl md:text-3xl font-normal">
                  {product.price.toLocaleString()} ₴
                </span>
                <span className="text-gray-900 text-2xl md:text-3xl font-normal">
                  -{product.discount_percentage}%
                </span>
                <span className="text-red-800">
                  {(
                    product.price *
                    (1 - product.discount_percentage / 100)
                  ).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ₴
                </span>
              </div>
            ) : (
              <span className="text-gray-900">{product.price} ₴</span>
            )}
          </div>

          {/* Color Picker */}
          {(product.colors && product.colors.length > 0) || relatedProducts.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="text-sm md:text-base font-['Montserrat'] uppercase tracking-wide text-gray-900">
                Колір: {selectedColor || (product.colors && product.colors[0]?.label) || ""}
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Current product colors */}
                {product.colors && product.colors.length > 0 && 
                  product.colors.map((c, idx) => {
                    const isActive = selectedColor === c.label || (!selectedColor && idx === 0);
                    return (
                      <button
                        key={`current-${c.label}-${idx}`}
                        type="button"
                        onClick={() => setSelectedColor(c.label)}
                        className={`relative w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                          isActive
                            ? "border-gray-900 scale-110"
                            : "border-gray-300 hover:border-gray-600"
                        }`}
                        aria-label={c.label}
                        title={c.label}
                        style={{
                          backgroundColor: c.hex || "#ffffff",
                        }}
                      />
                    );
                  })
                }

                {/* Related products colors */}
                {relatedProducts.map((relatedProduct) => {
                  if (!relatedProduct.first_color) return null;
                  
                  const color = relatedProduct.first_color;
                  
                  return (
                    <button
                      key={`related-${relatedProduct.id}`}
                      type="button"
                      onClick={() => handleColorVariantChange(relatedProduct.id)}
                      disabled={isLoading}
                      className={`relative w-10 h-10 rounded-full border-2 border-gray-300 transition-all duration-200 hover:border-gray-600 cursor-pointer ${
                        isLoading ? 'opacity-50 cursor-wait' : ''
                      }`}
                      aria-label={`Переглянути ${color.label}`}
                      title={color.label}
                      style={{ 
                        backgroundColor: color.hex || "#ffffff",
                        opacity: 0.7
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Size Picker */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="text-sm md:text-base font-['Montserrat'] uppercase tracking-wide text-gray-900">
                Розмір
              </div>
              <button
                onClick={() => setShowSizeGuide(true)}
                className="text-sm text-gray-600 underline hover:text-black cursor-pointer transition-all duration-200"
              >
                Таблиця розмірів
              </button>
            </div>

            {/* Size Options */}
            {sizes.length === 0 ? (
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded border text-sm uppercase tracking-wide bg-red-50 text-red-700 border-red-200 w-fit">
                Немає в наявності
              </div>
            ) : (
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border-2 text-sm font-['Montserrat'] uppercase cursor-pointer transition-all duration-200 rounded-full ${
                    selectedSize === size
                      ? "border-gray-900 bg-gray-900 text-white font-semibold"
                      : "border-gray-300 bg-white text-gray-900 hover:border-gray-600"
                  }`}
                >
                  {SIZE_MAP[size] || size}
                </button>
              ))}
            </div>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={outOfStock || isAddingToCart ? undefined : handleAddToCart}
            disabled={outOfStock || isAddingToCart}
            className={`w-full text-center bg-black text-white hover:bg-gray-800 py-4 px-6 text-base md:text-lg font-medium font-['Montserrat'] uppercase tracking-wider transition-all duration-200 ${
              outOfStock || isAddingToCart
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:opacity-90"
            }`}
          >
            {isAddingToCart ? "Додавання..." : "В КОШИК"}
          </button>

          {/* Telegram Manager Link */}
          <a
            href="https://t.me/13vplusukraineanbrand"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center border border-gray-400 text-gray-600 hover:border-black hover:text-black py-3 px-4 text-sm md:text-base font-light font-['Montserrat'] cursor-pointer transition-all duration-200"
          >
            Написати менеджеру
          </a>

          {/* Size Guide Modal */}
          {showSizeGuide && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowSizeGuide(false)}
            >
              <div
                className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-auto max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowSizeGuide(false)}
                  className="absolute top-6 right-6 bg-black text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl font-light hover:bg-gray-800 transition-colors z-10"
                >
                  ×
                </button>

                <div className="p-8 md:p-12">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight font-['Montserrat']">
                      РОЗМІРНА СІТКА
                    </h2>
                    <div className="mt-2 text-sm text-gray-500 font-['Montserrat']">
                      Всі вимірювання вказані в сантиметрах
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-black border-collapse">
                      <thead>
                        <tr className="border-b-2 border-black">
                          <th className="py-4 px-3 text-center text-xs md:text-sm font-bold uppercase tracking-wider font-['Montserrat']">
                            Розмір
                          </th>
                          <th className="py-4 px-3 text-center text-xs md:text-sm font-bold uppercase tracking-wider font-['Montserrat']">
                            Обхват
                            <br />
                            грудей
                          </th>
                          <th className="py-4 px-3 text-center text-xs md:text-sm font-bold uppercase tracking-wider font-['Montserrat']">
                            Обхват
                            <br />
                            талії
                          </th>
                          <th className="py-4 px-3 text-center text-xs md:text-sm font-bold uppercase tracking-wider font-['Montserrat']">
                            Обхват
                            <br />
                            бедер
                          </th>
                          <th className="py-4 px-3 text-center text-xs md:text-sm font-bold uppercase tracking-wider font-['Montserrat']">
                            Зріст
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-5 px-3 text-center font-bold text-lg font-['Montserrat']">
                            S
                          </td>
                          <td className="py-5 px-3 text-center font-['Montserrat']">
                            <div className="text-base">88-92</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Montserrat']">
                            <div className="text-base">77-80</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Montserrat']">
                            <div className="text-base">93-96</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Montserrat']">
                            <div className="text-base">175-180</div>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-5 px-3 text-center font-bold text-lg font-['Montserrat']">
                            M
                          </td>
                          <td className="py-5 px-3 text-center font-['Montserrat']">
                            <div className="text-base">96-100</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Montserrat']">
                            <div className="text-base">84-88</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Montserrat']">
                            <div className="text-base">98-101</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Montserrat']">
                            <div className="text-base">180-185</div>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-5 px-3 text-center font-bold text-lg font-['Montserrat']">
                            L
                          </td>
                          <td className="py-5 px-3 text-center font-['Montserrat']">
                            <div className="text-base">104-108</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Montserrat']">
                            <div className="text-base">92-97</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Montserrat']">
                            <div className="text-base">103-106</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Montserrat']">
                            <div className="text-base">180-190</div>
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="py-5 px-3 text-center font-bold text-lg font-['Montserrat']">
                            XL
                          </td>
                          <td className="py-5 px-3 text-center font-['Montserrat']">
                            <div className="text-base">112-116</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Montserrat']">
                            <div className="text-base">100-104</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Montserrat']">
                            <div className="text-base">108-111</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Montserrat']">
                            <div className="text-base">190+</div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="text-center mt-10 pt-6 border-t border-gray-200">
                    <Image
                      src="/images/13VPLUS BLACK PNG 2.png"
                      alt="13VPLUS Logo"
                      width={200}
                      height={40}
                      className="mx-auto w-48 h-auto opacity-80"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cart Alert */}
      <CartAlert
        isVisible={showCartAlert}
        onGoToCart={() => {
          setShowCartAlert(false);
          setIsBasketOpen(true);
        }}
      />

          {/* Alert */}
          <Alert
            type={alertType}
            message={alertMessage || ""}
            isVisible={!!alertMessage}
            onClose={() => setAlertMessage(null)}
          />

          {/* Description Section */}
          <div className="w-full md:w-[522px]">
            <div className="mb-3 md:mb-4 text-xl md:text-2xl font-['Montserrat'] uppercase tracking-tight">
              опис
            </div>
            <div className="text-sm md:text-lg font-['Montserrat'] leading-relaxed tracking-wide">
              {product.description}
            </div>
          </div>

          {product.fabric_composition && (
            <div className="opacity-90">
              <h3>Cклад тканини: </h3>
              <span>{product.fabric_composition}</span>
            </div>
          )}

          {product.has_lining && (
            <div className="opacity-90">
              <h3>Підкладка: </h3>
              <span>{product.lining_description}</span>
            </div>
          )}
        </div>
      </div>

      {/* Media Modal for Mobile */}
      {isMediaModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/95 lg:hidden"
          onClick={() => setIsMediaModalOpen(false)}
        >
          <div className="relative w-full h-full flex items-start justify-center">
            <Swiper
              modules={[Navigation]}
              initialSlide={activeImageIndex}
              onSlideChange={(s) => setActiveImageIndex(s.activeIndex)}
              slidesPerView={1}
              spaceBetween={0}
              className="w-full h-full"
            >
              {media.map((item, i) => (
                <SwiperSlide key={i}>
                  <div className="relative w-full h-full flex items-start justify-center">
                    {item.type === "video" ? (
                      <video
                        className="object-contain w-full h-full"
                        src={`/api/images/${item.url}`}
                        autoPlay
                        loop
                        muted
                        playsInline
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <Image
                        src={`/api/images/${item.url}`}
                        alt={`Product view ${i + 1}`}
                        fill
                        className="object-contain"
                        sizes="100vw"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <button
              onClick={() => setIsMediaModalOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-white/80 transition-colors z-10 bg-black/50 rounded-full p-2"
              aria-label="Закрити"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            {media.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm z-10">
                {activeImageIndex + 1} / {media.length}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
