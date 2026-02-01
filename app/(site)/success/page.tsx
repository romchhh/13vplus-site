"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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
  const [orderId, setOrderId] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [state, setState] = useState<PageState>("loading");
  const [refreshing, setRefreshing] = useState(false);

  const orderRef = searchParams.get("orderReference");

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
    if (!orderRef) {
      setState("invalid");
      return;
    }
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

  // Оплата ще не підтверджена (WayForPay/Plisio ще не надіслали webhook)
  if (state === "pending") {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
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
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
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

  // state === "paid" — показуємо сторінку успішної оплати
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Оплата успішна!</h1>
          <p className="text-lg text-gray-600 mb-6">
            Дякуємо за ваше замовлення. Ваш платіж було успішно оброблено.
          </p>

          {order && order.items && order.items.length > 0 ? (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 text-left">Товари у замовленні</h2>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold w-16">Фото</th>
                      <th className="px-4 py-3 text-left font-semibold">Назва продукту</th>
                      <th className="px-4 py-3 text-left font-semibold">Розмір</th>
                      <th className="px-4 py-3 text-left font-semibold">Колір</th>
                      <th className="px-4 py-3 text-left font-semibold">Кількість</th>
                      <th className="px-4 py-3 text-left font-semibold">Ціна (₴)</th>
                      <th className="px-4 py-3 text-left font-semibold">Сума (₴)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.items.map((item, index) => {
                      const itemTotal = Number(item.price) * item.quantity;
                      return (
                        <tr key={`order-item-${index}`} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            {item.imageUrl ? (
                              <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded overflow-hidden">
                                <Image
                                  src={`/api/images/${item.imageUrl}`}
                                  alt={item.product_name}
                                  width={64}
                                  height={64}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            ) : (
                              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-gray-400 text-xs">Фото</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-800">{item.product_name}</td>
                          <td className="px-4 py-3 text-gray-600">{item.size}</td>
                          <td className="px-4 py-3 text-gray-600">{item.color || "—"}</td>
                          <td className="px-4 py-3 text-gray-600">{item.quantity}</td>
                          <td className="px-4 py-3 text-gray-600">{Number(item.price).toFixed(2)}</td>
                          <td className="px-4 py-3 text-gray-600">{itemTotal.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={6} className="px-4 py-3 text-right font-semibold text-gray-800">Загальна сума:</td>
                      <td className="px-4 py-3 font-bold text-green-600">
                        {order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0).toFixed(2)} ₴
                      </td>
                    </tr>
                    {order.payment_type === "installment" && (
                      <tr>
                        <td colSpan={6} className="px-4 py-3 text-right font-semibold text-gray-800">Залишок до оплати:</td>
                        <td className="px-4 py-3 font-semibold text-gray-600">0.00 ₴</td>
                      </tr>
                    )}
                  </tfoot>
                </table>
              </div>
            </div>
          ) : orderId ? (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Номер замовлення:</p>
              <p className="text-lg font-semibold text-gray-900">{orderId}</p>
            </div>
          ) : null}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-blue-800"><strong>Що далі?</strong></p>
            <ul className="mt-2 text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Ми отримали ваше замовлення та платіж</li>
              <li>Наш менеджер зв&apos;яжеться з вами найближчим часом</li>
              <li>Ви отримаєте підтвердження на вказану електронну пошту</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800"
            >
              Продовжити покупки
            </Link>
            <Link
              href="/contacts"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Зв&apos;язатися з нами
            </Link>
          </div>
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

