"use client";

import { useState } from "react";
import { useBasket } from "@/lib/BasketProvider";
import Link from "next/link";
import Image from "next/image";
import { getItemSubtotal } from "@/lib/pricing";

interface SidebarBasketProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function getItemImageSrc(imageUrl: string): string {
  if (!imageUrl) return "https://placehold.co/100x150/cccccc/666666?text=No+Image";
  if (imageUrl.startsWith("http")) return imageUrl;
  if (imageUrl.startsWith("/")) return imageUrl;
  return `/api/images/${imageUrl}`;
}

export default function SidebarBasket({
  isOpen,
  setIsOpen,
}: SidebarBasketProps) {
  const { items, removeItem, updateQuantity, clearBasket } = useBasket();
  const [quantityError, setQuantityError] = useState<Record<string, string>>({});

  const total = items.reduce(
    (sum, item) => sum + getItemSubtotal(item.price, item.quantity, item.discount_percentage),
    0
  );

  return (
    <div className="relative z-50">
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-4/5 sm:max-w-md bg-white shadow-lg z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } overflow-y-auto flex flex-col`}
      >
        {/* Заголовок: ВАШ КОШИК (N) + X */}
        <div className="flex justify-between items-center px-3 py-3 sm:px-4 sm:py-4 border-b border-[#3D1A00]/10">
          <h2 className="font-['Montserrat'] font-semibold text-lg sm:text-xl text-[#3D1A00] uppercase tracking-tight">
            ВАШ КОШИК ({items.length > 0 ? items.reduce((acc, i) => acc + i.quantity, 0) : 0})
          </h2>
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center text-[#3D1A00]/70 hover:text-[#3D1A00] text-2xl leading-none"
            onClick={() => setIsOpen(false)}
            aria-label="Закрити кошик"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col flex-1 px-3 py-3 sm:px-4 sm:py-4">
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 gap-6">
              <p className="font-['Montserrat'] font-medium text-[#3D1A00] text-lg sm:text-xl text-center">
                Ваш кошик порожній
              </p>
              <Link
                href="/catalog"
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto min-w-[200px] py-3.5 px-6 rounded-xl bg-[#8B9A47] hover:bg-[#7a8940] text-white font-['Montserrat'] font-semibold text-sm uppercase tracking-tight text-center transition-colors"
              >
                Продовжити покупки
              </Link>
            </div>
          )}

          {items.map((item) => {
            const displayPrice = item.discount_percentage
              ? Math.round(item.price * (1 - item.discount_percentage / 100))
              : item.price;
            return (
              <div
                key={`${item.id}-${item.size}`}
                className="border border-[#3D1A00]/15 rounded-lg flex flex-row items-stretch gap-2 min-h-[120px] px-3 py-3 mb-4 last:mb-0"
              >
                {/* Ліва частина: назва, опис, кількість, ціна */}
                <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                  <div>
                    <p className="font-['Montserrat'] font-semibold text-[#3D1A00] uppercase text-sm sm:text-base">
                      {item.name}
                    </p>
                    {item.subtitle && (
                      <p className="font-['Montserrat'] text-[#3D1A00]/80 text-xs sm:text-sm leading-relaxed line-clamp-2 mt-1">
                        {item.subtitle}
                      </p>
                    )}
                    {quantityError[`${item.id}-${item.size}`] && (
                      <p className="text-red-600 text-xs mt-1 font-['Montserrat']">
                        {quantityError[`${item.id}-${item.size}`]}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <div className="flex items-center border border-[#3D1A00]/20 rounded overflow-hidden shrink-0">
                      <button
                        type="button"
                        className="w-9 h-9 flex items-center justify-center text-[#3D1A00] hover:bg-[#3D1A00]/5 disabled:opacity-50 disabled:cursor-not-allowed font-['Montserrat'] text-lg"
                        onClick={async () => {
                          try {
                            await updateQuantity(item.id, item.size, item.quantity - 1);
                            setQuantityError((prev) => {
                              const next = { ...prev };
                              delete next[`${item.id}-${item.size}`];
                              return next;
                            });
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        aria-label="Зменшити кількість"
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span
                        className="w-8 h-9 flex items-center justify-center font-['Montserrat'] text-sm text-[#3D1A00] border-x border-[#3D1A00]/20 bg-transparent"
                        aria-live="polite"
                        aria-atomic="true"
                      >
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="w-9 h-9 flex items-center justify-center text-[#3D1A00] hover:bg-[#3D1A00]/5 font-['Montserrat'] text-lg"
                        onClick={async () => {
                          try {
                            await updateQuantity(item.id, item.size, item.quantity + 1);
                            setQuantityError((prev) => {
                              const next = { ...prev };
                              delete next[`${item.id}-${item.size}`];
                              return next;
                            });
                          } catch (err) {
                            setQuantityError((prev) => ({
                              ...prev,
                              [`${item.id}-${item.size}`]:
                                err instanceof Error ? err.message : "Недостатньо товару",
                            }));
                            setTimeout(() => {
                              setQuantityError((prev) => {
                                const next = { ...prev };
                                delete next[`${item.id}-${item.size}`];
                                return next;
                              });
                            }, 5000);
                          }
                        }}
                        aria-label="Збільшити кількість"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-['Montserrat'] font-normal text-[#3D1A00] text-sm sm:text-base">
                      {displayPrice.toLocaleString("uk-UA")} грн
                    </span>
                  </div>
                </div>

                {/* Права частина: фото 90% висоти блоку */}
                <div className="shrink-0 flex items-center self-stretch w-28 sm:w-32">
                  <div className="relative w-full h-[90%] min-h-[100px] rounded overflow-hidden bg-[#fafafa]">
                    <button
                      type="button"
                      className="absolute top-0 right-0 z-10 w-6 h-6 flex items-center justify-center rounded-bl bg-white/90 text-[#3D1A00]/80 hover:text-[#3D1A00] border-b border-l border-[#3D1A00]/20 text-sm"
                      onClick={() => removeItem(item.id, item.size)}
                      aria-label={`Видалити ${item.name} з кошика`}
                    >
                      ×
                    </button>
                    <Image
                      src={getItemImageSrc(item.imageUrl)}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {items.length > 0 && (
            <>
              {/* Всього */}
              <div className="mt-4 pt-4 border-t border-[#3D1A00]/10 space-y-1 font-['Montserrat'] text-[#3D1A00]">
                <div className="flex justify-between items-center text-sm sm:text-base font-medium">
                  <span>Всього:</span>
                  <span>{Math.round(total).toLocaleString("uk-UA")} грн</span>
                </div>
              </div>

              {/* Кнопки: ОЧИСТИТИ | ПРОДОВЖИТИ */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    clearBasket();
                    setIsOpen(false);
                  }}
                  className="flex-1 py-3 px-4 text-center border-2 border-[#3D1A00] bg-white text-[#3D1A00] font-['Montserrat'] font-normal uppercase text-sm sm:text-base tracking-tight hover:bg-[#3D1A00]/5 transition-colors"
                >
                  ОЧИСТИТИ
                </button>
                <Link
                  href="/final"
                  className="flex-1 py-3 px-4 text-center bg-[#D7D799] text-[#3D1A00] font-['Montserrat'] font-normal uppercase text-sm sm:text-base tracking-tight hover:bg-[#c5c58a] transition-colors border border-[#b8b87a]"
                  onClick={() => setIsOpen(false)}
                >
                  ПРОДОВЖИТИ
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
