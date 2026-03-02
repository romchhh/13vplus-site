"use client";

import { useAppContext } from "@/lib/GeneralProvider";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useBasket } from "@/lib/BasketProvider";
import Image from "next/image";
import Link from "next/link";
import Alert from "@/components/shared/Alert";
import CartAlert from "@/components/shared/CartAlert";
import { getFirstProductImage } from "@/lib/getFirstProductImage";

const DEFAULT_SIZE = "—";

type TabId = "description" | "action" | "usage" | "composition" | "contraindications";

const TABS: { id: TabId; label: string }[] = [
  { id: "description", label: "ОПИС" },
  { id: "action", label: "ДІЯ АКТИВНИХ КОМПОНЕНТІВ" },
  { id: "usage", label: "СПОСІБ ВИКОРИСТАННЯ" },
  { id: "composition", label: "СКЛАД" },
  { id: "contraindications", label: "ПРОТИПОКАЗАННЯ" },
];

interface ProductClientProps {
  product: {
    id: number;
    name: string;
    price: number;
    stock?: number;
    in_stock?: boolean;
    old_price?: number | null;
    discount_percentage?: number | null;
    subtitle?: string | null;
    release_form?: string | null;
    course?: string | null;
    package_weight?: string | null;
    main_info?: string | null;
    short_description?: string | null;
    description?: string | null;
    main_action?: string | null;
    indications_for_use?: string | null;
    benefits?: string | null;
    full_composition?: string | null;
    usage_method?: string | null;
    contraindications?: string | null;
    storage_conditions?: string | null;
    media?: { url: string; type: string }[];
    fabric_composition?: string | null;
    has_lining?: boolean;
    lining_description?: string | null;
    category_name?: string | null;
    category_slug?: string | null;
  };
}

export default function ProductClient({ product: initialProduct }: ProductClientProps) {
  const [product] = useState(initialProduct);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>("description");
  const router = useRouter();
  const { addItem } = useBasket();
  const { setIsBasketOpen } = useAppContext();
  const [showCartAlert, setShowCartAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<
    "success" | "error" | "warning" | "info"
  >("info");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const isAddingToCartRef = useRef(false);

  const handleAddToCart = async () => {
    if (isAddingToCartRef.current) return;
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
        size: DEFAULT_SIZE,
        quantity,
        imageUrl: getFirstProductImage(media),
        discount_percentage: product.discount_percentage ?? undefined,
        subtitle: product.main_info || product.short_description || undefined,
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

  const handleBuyInOneClick = async () => {
    if (isAddingToCartRef.current) return;
    if (!product || !addItem) {
      setAlertMessage(product ? "Кошик недоступний. Спробуйте оновити сторінку." : "Товар не завантажений");
      setAlertType("error");
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }
    if (outOfStock) {
      setAlertMessage("Товар недоступний для замовлення");
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
        size: DEFAULT_SIZE,
        quantity,
        imageUrl: getFirstProductImage(media),
        discount_percentage: product.discount_percentage ?? undefined,
        subtitle: product.main_info || product.short_description || undefined,
      });
      router.push("/final");
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
  const outOfStock = product.in_stock === false || (product.stock ?? 0) <= 0;
  const displayPrice = product.discount_percentage
    ? Math.round(product.price * (1 - product.discount_percentage / 100))
    : product.price;

  const categorySlug = product.category_slug ?? (product.category_name ? encodeURIComponent(product.category_name) : null);
  const categoryUrl = categorySlug ? `/catalog/${categorySlug}` : "/catalog";

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  const attributesLine1 = product.release_form || product.subtitle || null;
  const attributesLine2 = [product.package_weight, product.course].filter(Boolean).join(" / ") || null;
  const purposeText = product.main_info || product.short_description || product.description;

  const renderTabContent = () => {
    switch (activeTab) {
      case "description":
        return product.description ? (
          <div className="text-[#3D1A00]/90 font-['Montserrat'] font-normal leading-[1.59] tracking-[-0.02em] text-sm md:text-base whitespace-pre-line">
            {product.description}
          </div>
        ) : (
          <p className="text-[#3D1A00]/70 font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-sm">Опис відсутній.</p>
        );
      case "action":
        return (product.main_action || product.benefits || product.indications_for_use) ? (
          <div className="text-[#3D1A00]/90 font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-sm md:text-base whitespace-pre-line">
            {[product.main_action, product.benefits, product.indications_for_use].filter(Boolean).join("\n\n")}
          </div>
        ) : (
          <p className="text-[#3D1A00]/70 font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-sm">Інформація відсутня.</p>
        );
      case "usage":
        return product.usage_method ? (
          <div className="text-[#3D1A00]/90 font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-sm md:text-base whitespace-pre-line">
            {product.usage_method}
          </div>
        ) : (
          <p className="text-[#3D1A00]/70 font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-sm">Інформація відсутня.</p>
        );
      case "composition":
        return (product.full_composition || product.fabric_composition) ? (
          <div className="text-[#3D1A00]/90 font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-sm md:text-base whitespace-pre-line">
            {product.full_composition || product.fabric_composition}
          </div>
        ) : (
          <p className="text-[#3D1A00]/70 font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-sm">Інформація відсутня.</p>
        );
      case "contraindications":
        return product.contraindications ? (
          <div className="text-[#3D1A00]/90 font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-sm md:text-base whitespace-pre-line">
            {product.contraindications}
          </div>
        ) : (
          <p className="text-[#3D1A00]/70 font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-sm">Інформація відсутня.</p>
        );
      default:
        return null;
    }
  };

  return (
    <section className="w-full bg-[#FFFFFF] min-h-screen">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-6 lg:py-8">
        {/* Breadcrumbs — тільки з md і вище */}
        <nav className="hidden md:block mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-[#3D1A00]/70">
            <li>
              <Link href="/" className="hover:text-[#3D1A00] transition-colors">
                Головна
              </Link>
            </li>
            <li aria-hidden className="text-[#3D1A00]/50">|</li>
            <li>
              {product.category_name ? (
                <Link href={categoryUrl} className="hover:text-[#3D1A00] transition-colors">
                  {product.category_name}
                </Link>
              ) : (
                <Link href="/catalog" className="hover:text-[#3D1A00] transition-colors">
                  Каталог
                </Link>
              )}
            </li>
            <li aria-hidden className="text-[#3D1A00]/50">|</li>
            <li className="text-[#3D1A00] font-normal">{product.name}</li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 lg:items-start mt-6 lg:mt-8">
          {/* Left: Thumbnails + Main image */}
          <div className="flex flex-row gap-4 w-full lg:w-[58%] lg:max-w-[58%]">
            {media.length > 1 && (
              <div className="flex flex-col gap-2 w-16 md:w-20 flex-shrink-0 order-2 lg:order-1">
                {media.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImageIndex(i)}
                    className={`relative aspect-square w-full rounded overflow-hidden border-2 transition-colors ${
                      activeImageIndex === i
                        ? "border-[#3D1A00]"
                        : "border-transparent hover:border-[#3D1A00]/30"
                    }`}
                  >
                    {item.type === "video" ? (
                      <video
                        className="w-full h-full object-cover"
                        src={`/api/images/${item.url}`}
                        muted
                        playsInline
                      />
                    ) : (
                      <Image
                        src={`/api/images/${item.url}`}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
            <div className="relative flex-1 min-h-[420px] sm:min-h-[480px] md:min-h-[520px] lg:min-h-[620px] xl:min-h-[700px] bg-[#fafafa] rounded overflow-hidden order-1 lg:order-2">
              {media[activeImageIndex]?.type === "video" ? (
                <video
                  className="w-full h-full object-contain"
                  src={`/api/images/${media[activeImageIndex]?.url}`}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : media[activeImageIndex] ? (
                <Image
                  src={`/api/images/${media[activeImageIndex].url}`}
                  alt={product.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#3D1A00]/40 font-['Montserrat']">
                  Немає зображення
                </div>
              )}
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex flex-col gap-4 w-full lg:max-w-[45%] font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em]">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#3D1A00] capitalize leading-[1.29] tracking-[-0.02em]" style={{ fontFamily: "Montserrat, sans-serif" }}>
              {product.name}
            </h1>

            <p className="text-sm md:text-base font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-[#3D1A00]/80">
              {outOfStock ? "Немає в наявності" : "В наявності"}
            </p>

            {(attributesLine1 || attributesLine2) && (
              <div className="flex flex-col gap-0.5 text-sm font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-[#3D1A00]/80">
                {attributesLine1 && <span>{attributesLine1}</span>}
                {attributesLine2 && <span>{attributesLine2}</span>}
              </div>
            )}

            {purposeText && (
              <p className="text-sm md:text-base font-['Montserrat'] font-normal leading-[1.59] tracking-[-0.02em] text-[#3D1A00]/90">
                Призначення: {purposeText}
              </p>
            )}

            <div className="flex items-center justify-between gap-4 pt-2 flex-wrap">
              <span className="text-2xl md:text-2xl font-['Montserrat'] font-normal leading-[1.59] tracking-[-0.02em] text-[#3D1A00]">
                {displayPrice.toLocaleString("uk-UA")} грн
              </span>
              <div className="flex items-center border border-[#3D1A00]/20 rounded overflow-hidden shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-[#3D1A00] hover:bg-[#3D1A00]/5 transition-colors"
                  aria-label="Зменшити"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!Number.isNaN(v) && v >= 1) setQuantity(v);
                  }}
                  className="w-14 h-10 py-0 px-2 text-center text-[#3D1A00] border-x border-[#3D1A00]/20 bg-transparent font-['Montserrat'] text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
 style={{ textAlign: "center" }}
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center text-[#3D1A00] hover:bg-[#3D1A00]/5 transition-colors"
                  aria-label="Збільшити"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={outOfStock || isAddingToCart ? undefined : handleAddToCart}
                disabled={outOfStock || isAddingToCart}
                className="flex-1 py-3 px-6 text-center border-2 border-[#3D1A00] bg-white text-[#3D1A00] font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] uppercase text-sm md:text-base transition-colors hover:bg-[#3D1A00]/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? "Додавання..." : "В КОШИК"}
              </button>
              <button
                type="button"
                onClick={outOfStock || isAddingToCart ? undefined : handleBuyInOneClick}
                disabled={outOfStock || isAddingToCart}
                className="flex-1 py-3 px-6 text-center bg-[#D7D799] hover:bg-[#c5c58a] text-[#3D1A00] font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] uppercase text-sm md:text-base transition-colors border border-[#b8b87a] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? "Додавання..." : "КУПИТИ В 1 КЛІК"}
              </button>
            </div>

            <CartAlert
              isVisible={showCartAlert}
              onGoToCart={() => {
                setShowCartAlert(false);
                setIsBasketOpen(true);
              }}
            />
            <Alert
              type={alertType}
              message={alertMessage || ""}
              isVisible={!!alertMessage}
              onClose={() => setAlertMessage(null)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12 pt-8 border-t border-[#3D1A00]/10">
          <div className="flex flex-wrap gap-6 md:gap-8 border-b border-[#3D1A00]/15 pb-1 mb-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-sm uppercase transition-colors ${
                  activeTab === tab.id
                    ? "text-[#3D1A00] font-semibold border-b-2 border-[#3D1A00] pb-1 -mb-[3px]"
                    : "text-[#3D1A00]/70 hover:text-[#3D1A00]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="min-h-[120px]">{renderTabContent()}</div>
        </div>
      </div>
    </section>
  );
}
