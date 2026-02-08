"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  size: string;
  color: string | null;
  product: {
    id: number;
    name: string;
    imageUrl?: string | null;
  } | null;
}

interface Order {
  id: number;
  customerName: string;
  phoneNumber: string;
  email: string | null;
  deliveryMethod: string;
  city: string;
  postOffice: string;
  comment: string | null;
  paymentType: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
    if (!session?.user || !id) return;

    fetch(`/api/users/orders/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Замовлення не знайдено");
        return res.json();
      })
      .then(setOrder)
      .catch(() => setError("Замовлення не знайдено"))
      .finally(() => setLoading(false));
  }, [session, status, id, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white pt-20">
        <div className="text-xl font-['Montserrat'] text-gray-600">Завантаження...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto text-center py-12">
          <p className="text-gray-600 font-['Montserrat'] mb-6">{error || "Замовлення не знайдено"}</p>
          <Link
            href="/profile?tab=orders"
            className="inline-block px-6 py-3 bg-black text-white font-['Montserrat'] font-medium uppercase hover:bg-gray-800 transition-colors"
          >
            Назад до замовлень
          </Link>
        </div>
      </div>
    );
  }

  const total = order.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const deliveryLabel =
    order.deliveryMethod === "nova_poshta_branch"
      ? "Нова пошта (відділення)"
      : order.deliveryMethod === "nova_poshta_courier"
        ? "Нова пошта (кур'єр)"
        : order.deliveryMethod === "nova_poshta_locker"
          ? "Нова пошта (поштомат)"
          : order.deliveryMethod === "showroom_pickup"
            ? "Самовивіз"
            : order.deliveryMethod;

  const paymentLabel =
    order.paymentType === "full"
      ? "Повна оплата"
      : order.paymentType === "prepay"
        ? "Передоплата 200 грн"
        : order.paymentType === "pay_after"
          ? "Оплата після (при отриманні)"
          : order.paymentType === "test_payment"
            ? "Тест оплата"
            : order.paymentType === "installment"
            ? "В розсрочку"
            : order.paymentType === "crypto"
              ? "Криптовалюта"
              : order.paymentType;

  return (
    <div className="min-h-screen bg-white pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/profile?tab=orders"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black font-['Montserrat'] text-sm mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Назад до замовлень
        </Link>

        <h1 className="text-2xl font-bold font-['Montserrat'] uppercase tracking-wider mb-2">
          Замовлення #{order.id}
        </h1>
        <p className="text-gray-600 font-['Montserrat'] text-sm mb-8">
          {new Date(order.createdAt).toLocaleDateString("uk-UA", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        <div className="space-y-6">
          <section className="border border-gray-200 p-6">
            <h2 className="text-sm font-bold font-['Montserrat'] uppercase text-gray-500 mb-4">
              Товари
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full font-['Montserrat'] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500 uppercase tracking-wider">
                    <th className="py-3 pr-2 w-16 sm:w-20">Фото</th>
                    <th className="py-3 pr-2">Товар</th>
                    <th className="py-3 pr-2 hidden sm:table-cell">Розмір</th>
                    <th className="py-3 pr-2 hidden sm:table-cell">Колір</th>
                    <th className="py-3 pr-2 text-center">К-сть</th>
                    <th className="py-3 pr-2 text-right">Ціна</th>
                    <th className="py-3 text-right">Сума</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => {
                    const subtotal = Number(item.price) * item.quantity;
                    return (
                      <tr key={item.id} className="border-b border-gray-100 align-middle">
                        <td className="py-3 pr-2">
                          <Link href={item.product ? `/product/${item.product.id}` : "/catalog"} className="block relative w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 overflow-hidden rounded flex-shrink-0">
                            {item.product?.imageUrl ? (
                              <Image
                                src={`/api/images/${item.product.imageUrl}`}
                                alt={item.product?.name || "Товар"}
                                width={64}
                                height={64}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400 text-xs">Фото</span>
                              </div>
                            )}
                          </Link>
                        </td>
                        <td className="py-3 pr-2">
                          {item.product ? (
                            <Link href={`/product/${item.product.id}`} className="text-black hover:underline font-medium">
                              {item.product.name}
                            </Link>
                          ) : (
                            <span>Товар</span>
                          )}
                        </td>
                        <td className="py-3 pr-2 hidden sm:table-cell">{item.size}</td>
                        <td className="py-3 pr-2 hidden sm:table-cell text-gray-600">{item.color || "—"}</td>
                        <td className="py-3 pr-2 text-center">{item.quantity}</td>
                        <td className="py-3 pr-2 text-right">{Number(item.price).toFixed(2)} грн</td>
                        <td className="py-3 text-right font-medium">{subtotal.toFixed(2)} грн</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between font-['Montserrat'] font-bold">
              <span>Всього:</span>
              <span>{total.toFixed(2)} грн</span>
            </div>
          </section>

          <section className="border border-gray-200 p-6">
            <h2 className="text-sm font-bold font-['Montserrat'] uppercase text-gray-500 mb-4">
              Отримувач та доставка
            </h2>
            <dl className="space-y-2 font-['Montserrat'] text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-600">Ім&apos;я:</dt>
                <dd>{order.customerName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-600">Телефон:</dt>
                <dd>{order.phoneNumber}</dd>
              </div>
              {order.email && (
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-600">Email:</dt>
                  <dd>{order.email}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-gray-600">Доставка:</dt>
                <dd>{deliveryLabel}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-600">Місто:</dt>
                <dd>{order.city}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-600">Відділення / адреса:</dt>
                <dd className="text-right">{order.postOffice}</dd>
              </div>
              {order.comment && (
                <div className="pt-2 border-t border-gray-100">
                  <dt className="text-gray-600 mb-1">Коментар:</dt>
                  <dd className="text-gray-800">{order.comment}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="border border-gray-200 p-6">
            <h2 className="text-sm font-bold font-['Montserrat'] uppercase text-gray-500 mb-4">
              Оплата
            </h2>
            <p className="font-['Montserrat'] text-sm">
              Спосіб оплати: {paymentLabel}
            </p>
            <p className="font-['Montserrat'] text-sm mt-1 text-green-600 font-medium">
              Статус: Оплачено
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
