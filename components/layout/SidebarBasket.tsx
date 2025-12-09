"use client";

import { useBasket } from "@/lib/BasketProvider";
import Link from "next/link";
import Image from "next/image";

interface SidebarBasketProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SidebarBasket({
  isOpen,
  setIsOpen,
}: SidebarBasketProps) {
  const { items, removeItem, updateQuantity } = useBasket();

  return (
    <div className="relative z-50">
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-4/5 sm:max-w-md bg-white shadow-md z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } overflow-y-auto`}
      >
        <nav className="flex flex-col p-4 sm:p-6 space-y-6 text-base sm:text-lg">
          <div className="flex justify-between items-center text-xl sm:text-2xl font-semibold">
            <span>Кошик</span>
            <button
              className="hover:text-[#8C7461] text-2xl"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {items.length === 0 && <p>Ваш кошик порожній</p>}

            {items.map((item) => (
              <div
                key={`${item.id}-${item.size}`}
                className="flex gap-4 border-b pb-4 last:border-none"
              >
                <Image
                  src={
                    item.imageUrl
                      ? `/api/images/${item.imageUrl}`
                      : "https://placehold.co/100x150/cccccc/666666?text=No+Image"
                  }
                  alt={item.name}
                  width={96}
                  height={128}
                  className="w-24 h-32 object-cover"
                />
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <p className="text-base font-medium">{item.name}</p>
                    <div className="text-zinc-600 mt-1">
                      {item.discount_percentage ? (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-red-600">
                            {(
                              item.price *
                              (1 - item.discount_percentage / 100)
                            ).toFixed(2)}
                            ₴
                          </span>
                          <span className="line-through">{item.price}₴</span>
                          <span className="text-green-600 text-sm">
                            -{item.discount_percentage}%
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium">{item.price}₴</span>
                      )}
                    </div>
                    <p className="text-stone-900 mt-1">Розмір: {item.size}</p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-neutral-400/60 w-24 h-9 justify-between px-2">
                      <button
                        className="text-zinc-500 text-lg"
                        onClick={() =>
                          updateQuantity(item.id, item.size, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        className="text-zinc-500 text-lg"
                        onClick={() =>
                          updateQuantity(item.id, item.size, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="text-red-600 text-xl font-bold"
                      onClick={() => removeItem(item.id, item.size)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {items.length > 0 && (
              <Link
                href="/final"
                className="text-center py-3 rounded-md mt-4 bg-black text-white hover:bg-gray-800 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  setTimeout(() => {
                    window.location.href = "/final";
                  }, 100);
                }}
              >
                Оформити замовлення
              </Link>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
