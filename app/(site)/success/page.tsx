"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface OrderItem {
  id: number;
  product_name: string;
  size: string;
  color?: string | null;
  quantity: number;
  price: number;
}

interface OrderData {
  id: number;
  invoice_id: string;
  items: OrderItem[];
  payment_type: string;
  payment_status: string;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      // Get orderReference from URL params
      const orderRef = searchParams.get("orderReference");
      
      if (orderRef) {
        setOrderId(orderRef);
        // Clear basket and submitted order from localStorage
        try {
          localStorage.removeItem("basket");
          localStorage.removeItem("submittedOrder");
        } catch (error) {
          console.error("Failed to clear localStorage:", error);
        }

        // Fetch order details
        try {
          const response = await fetch(`/api/orders/by-invoice/${orderRef}`);
          if (response.ok) {
            const orderData = await response.json();
            setOrder(orderData);
          }
        } catch (error) {
          console.error("Failed to fetch order:", error);
        }
      }
      
      setLoading(false);
    }

    fetchOrder();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Оплата успішна!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Дякуємо за ваше замовлення. Ваш платіж було успішно оброблено.
          </p>

          {/* Order Items Table */}
          {order && order.items && order.items.length > 0 ? (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 text-left">
                Товари у замовленні
              </h2>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Назва продукту</th>
                      <th className="px-4 py-3 text-left font-semibold">Розмір</th>
                      <th className="px-4 py-3 text-left font-semibold">Колір</th>
                      <th className="px-4 py-3 text-left font-semibold">Кількість</th>
                      <th className="px-4 py-3 text-left font-semibold">Ціна (₴)</th>
                      <th className="px-4 py-3 text-left font-semibold">Сума (₴)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.items.map((item) => {
                      const itemTotal = Number(item.price) * item.quantity;
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
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
                      <td colSpan={5} className="px-4 py-3 text-right font-semibold text-gray-800">
                        Загальна сума:
                      </td>
                      <td className="px-4 py-3 font-bold text-green-600">
                        {order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0).toFixed(2)} ₴
                      </td>
                    </tr>
                    {order.payment_type === "installment" && (
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-right font-semibold text-gray-800">
                          Залишок до оплати:
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-600">
                          {order.payment_status === "paid" ? "0.00" : (
                            (order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0) * 0.7).toFixed(2)
                          )} ₴
                        </td>
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

          {/* Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-blue-800">
              <strong>Що далі?</strong>
            </p>
            <ul className="mt-2 text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Ми отримали ваше замовлення та платіж</li>
              <li>Наш менеджер зв&apos;яжеться з вами найближчим часом</li>
              <li>Ви отримаєте підтвердження на вказану електронну пошту</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 transition-colors"
            >
              Продовжити покупки
            </Link>
            <Link
              href="/contacts"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
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

