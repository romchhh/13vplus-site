"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageBreadCrumb from "@/components/admin/PageBreadCrumb";

interface OrderItem {
  id: number;
  size: string;
  quantity: number;
  price: string | number;
  color: string | null;
  product: { id: number; name: string } | null;
}

interface Order {
  id: number;
  customerName: string;
  email: string | null;
  phoneNumber: string;
  city: string;
  postOffice: string;
  paymentStatus: string;
  status: string | null;
  invoiceId: string;
  createdAt: string;
  items: OrderItem[];
}

interface UserDetail {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  clothingSize: string | null;
  birthDate: string | null;
  bonusPoints: number;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  accounts: Array<{ provider: string; providerAccountId: string }>;
  _count: { orders: number; wishlist: number };
  orders: Order[];
}

const paymentStatusLabels: Record<string, string> = {
  pending: "Очікує оплати",
  paid: "Оплачено",
  canceled: "Скасовано",
};

export default function UserDetailPage() {
  const params = useParams();
  const userId = params?.id as string;
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchUser = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) {
        if (res.status === 404) setError("Користувача не знайдено");
        else throw new Error("Failed to fetch");
        return;
      }
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error("Error fetching user:", err);
      setError("Помилка завантаження даних");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchUser is stable, only re-run when userId changes
  }, [userId]);

  if (loading) {
    return (
      <div className="w-full h-full p-4 md:p-6">
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="w-full h-full p-4 md:p-6">
        <PageBreadCrumb pageTitle="Користувачі" />
        <div className="rounded-lg bg-red-50 border border-red-200 p-6 text-center">
          <p className="text-red-700 font-medium">{error || "Користувача не знайдено"}</p>
          <Link
            href="/admin/users"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            ← Назад до списку користувачів
          </Link>
        </div>
      </div>
    );
  }

  const breadcrumbName = user.name || user.email || "Користувач";

  return (
    <div className="w-full h-full p-4 md:p-6">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/admin" className="hover:text-gray-900">
            Головна
          </Link>
          <span>/</span>
          <Link href="/admin/users" className="hover:text-gray-900">
            Користувачі
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{breadcrumbName}</span>
        </nav>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {user.name || "Без імені"}
        </h1>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          ← Назад до списку
        </Link>
      </div>

      <div className="space-y-6">
        {/* Основна інформація */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Профіль</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Телефон</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Адреса доставки</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.address || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Розмір одягу</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.clothingSize || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Дата народження</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user.birthDate
                  ? new Date(user.birthDate).toLocaleDateString("uk-UA")
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Дата реєстрації</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(user.createdAt).toLocaleString("uk-UA")}
              </dd>
            </div>
            {user.accounts.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Вхід через</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user.accounts.map((a) => a.provider).join(", ")}
                </dd>
              </div>
            )}
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <dt className="text-sm font-medium text-gray-500">Замовлень</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">{user._count.orders}</dd>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <dt className="text-sm font-medium text-gray-500">В обраному</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">{user._count.wishlist}</dd>
          </div>
        </div>

        {/* Замовлення */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Замовлення</h2>
          </div>
          <div className="overflow-x-auto">
            {user.orders.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                Немає замовлень
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      №
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Дата
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Статус оплати
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Сума
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Дія
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {user.orders.map((order) => {
                    const total = order.items.reduce(
                      (sum, item) => sum + Number(item.price) * item.quantity,
                      0
                    );
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString("uk-UA")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              order.paymentStatus === "paid"
                                ? "bg-green-100 text-green-800"
                                : order.paymentStatus === "canceled"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {paymentStatusLabels[order.paymentStatus] || order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {total.toFixed(2)} грн
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <Link
                            href={`/admin/orders/${order.id}/edit`}
                            className="text-blue-600 hover:underline"
                          >
                            Відкрити
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {user._count.orders > user.orders.length && (
              <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500 border-t">
                Показано останні {user.orders.length} з {user._count.orders} замовлень
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
