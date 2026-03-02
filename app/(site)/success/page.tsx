"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useBasket } from "@/lib/BasketProvider";

interface OrderItem {
  id?: number;
  product_name: string;
  size: string;
  color?: string | null;
  quantity: number;
  price: number;
  imageUrl?: string | null;
}

interface OrderData {
  id: number;
  invoice_id: string;
  items: OrderItem[];
  payment_type: string;
  payment_status: string;
}

type PageState = "loading" | "paid" | "pending" | "not_found" | "invalid";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const { clearBasket } = useBasket();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [state, setState] = useState<PageState>("loading");
  const [refreshing, setRefreshing] = useState(false);

  const orderRef = searchParams.get("orderReference");

  // Після повернення з Mono (redirectUrl без query) — беремо orderId з localStorage і редіректимо
  useEffect(() => {
    if (orderRef) return;
    try {
      const pending = localStorage.getItem("pendingPayment");
      if (pending) {
        const data = JSON.parse(pending) as { orderId?: string };
        if (data?.orderId) {
          window.location.replace(`/success?orderReference=${encodeURIComponent(data.orderId)}`);
          return;
        }
      }
      setState("invalid");
    } catch {
      setState("invalid");
    }
  }, [orderRef]);

  async function checkPayment() {
    if (!orderRef) {
      setState("invalid");
      return;
    }
    setOrderId(orderRef);
    try {
      const response = await fetch(`/api/orders/invoice/${orderRef}`);
      if (response.ok) {
        const orderData = await response.json();
        setOrder(orderData);
        setState("paid");
        clearBasket();
        try {
          localStorage.removeItem("basket");
          localStorage.removeItem("submittedOrder");
        } catch {
          // ignore
        }
      } else if (response.status === 409) {
        setState("pending");
      } else {
        setState("not_found");
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
      setState("not_found");
    }
  }

  useEffect(() => {
    if (!orderRef) return;
    let cancelled = false;
    setState("loading");
    setOrderId(orderRef);
    fetch(`/api/orders/invoice/${orderRef}`)
      .then((response) => {
        if (cancelled) return;
        if (response.ok) {
          return response.json().then((orderData: OrderData) => {
            if (cancelled) return;
            setOrder(orderData);
            setState("paid");
            clearBasket();
            try {
              localStorage.removeItem("basket");
              localStorage.removeItem("submittedOrder");
            } catch {
              // ignore
            }
          });
        }
        if (response.status === 409) {
          setState("pending");
        } else {
          setState("not_found");
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to fetch order:", error);
          setState("not_found");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [orderRef]);

  function handleRetry() {
    setRefreshing(true);
    checkPayment().finally(() => setRefreshing(false));
  }

  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Перевіряємо статус оплати...</p>
        </div>
      </div>
    );
  }

  // Оплата ще не підтверджена (Mono webhook ще не надіслав підтвердження)
  if (state === "pending") {
    return (
      <div className="min-h-screen bg-[var(--background-warm-yellow)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-6">
              <svg className="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Очікуємо підтвердження оплати</h1>
            <p className="text-gray-600 mb-6">
              Платіж обробляється. Як тільки ми отримаємо підтвердження, сторінка оновиться автоматично або натисніть кнопку нижче.
            </p>
            {orderId && (
              <p className="text-sm text-gray-500 mb-6">Номер замовлення: <span className="font-semibold">{orderId}</span></p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={handleRetry}
                disabled={refreshing}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50"
              >
                {refreshing ? "Перевірка..." : "Перевірити статус"}
              </button>
              <Link
                href="/final"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-[var(--background-warm-yellow)] hover:bg-black/5"
              >
                Повернутися до оформлення
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Замовлення не знайдено або невалідне посилання
  if (state === "not_found" || state === "invalid") {
    return (
      <div className="min-h-screen bg-[var(--background-warm-yellow)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-black/5 mb-6">
              <svg className="h-8 w-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {state === "invalid" ? "Невірне посилання" : "Замовлення не знайдено"}
            </h1>
            <p className="text-gray-600 mb-6">
              {state === "invalid"
                ? "У посиланні відсутній номер замовлення."
                : "Замовлення з таким номером не знайдено або посилання застаріле."}
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800"
            >
              Перейти в каталог
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // state === "paid" — сторінка оформленого замовлення з переліком товарів
  const total = order?.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0;
  const imageSrc = (url: string | null | undefined) =>
    !url ? undefined : url.startsWith("http") ? url : `/api/images/${url}`;

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-12">
      <div className="max-w-2xl mx-auto">
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm font-['Montserrat'] font-normal">
            <li>
              <Link href="/" className="text-[#3D1A00] hover:opacity-80 transition-opacity">
                Головна
              </Link>
            </li>
            <li className="text-gray-400">|</li>
            <li className="text-gray-400">Оформлення замовлення</li>
          </ol>
        </nav>

        <div className="text-center py-8 sm:py-12">
          <h1 className="font-['Montserrat'] font-bold text-3xl sm:text-4xl lg:text-5xl text-[#3D1A00] uppercase tracking-tight mb-4">
            Дякуємо!
          </h1>
          <p className="font-['Montserrat'] font-bold text-2xl sm:text-3xl lg:text-4xl text-[#3D1A00] uppercase tracking-tight mb-2">
            Ваше замовлення оформлене!
          </p>
          {order?.invoice_id && (
            <p className="font-['Montserrat'] text-sm text-[#3D1A00]/70 mb-10">
              Номер замовлення: <span className="font-semibold">{order.invoice_id}</span>
            </p>
          )}
        </div>

        {/* Список товарів замовлення */}
        {order?.items && order.items.length > 0 && (
          <div className="mb-10">
            <h2 className="font-['Montserrat'] font-semibold text-lg text-[#3D1A00] uppercase tracking-tight mb-4">
              Товари у замовленні
            </h2>
            <ul className="space-y-4 border border-[#3D1A00]/10 rounded-xl overflow-hidden divide-y divide-[#3D1A00]/10">
              {order.items.map((item, index) => {
                const itemTotal = item.price * item.quantity;
                const src = imageSrc(item.imageUrl);
                return (
                  <li key={index} className="flex gap-4 p-4 bg-white">
                    <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-[#f5f5f0] overflow-hidden">
                      {src ? (
                        <img
                          src={src}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#3D1A00]/30 text-xs font-['Montserrat']">
                          —
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-['Montserrat'] font-medium text-[#3D1A00] text-sm sm:text-base">
                        {item.product_name}
                        {item.color ? ` · ${item.color}` : ""}
                      </p>
                      <p className="font-['Montserrat'] text-[#3D1A00]/70 text-sm mt-0.5">
                        {item.quantity} шт.
                      </p>
                      <p className="font-['Montserrat'] font-semibold text-[#3D1A00] text-sm mt-1">
                        {itemTotal.toFixed(2)} ₴
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="font-['Montserrat'] font-bold text-[#3D1A00] text-lg mt-4 text-right">
              Разом: {total.toFixed(2)} ₴
            </p>
          </div>
        )}

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-['Montserrat'] font-semibold text-[#3D1A00] uppercase text-base tracking-tight bg-[#9B9B5A] hover:bg-[#8a8a4e] transition-colors"
          >
            Повернутися на головну
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Завантаження...</p>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}

