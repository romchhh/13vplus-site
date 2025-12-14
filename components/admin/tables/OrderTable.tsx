"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Link from "next/link";
import Pagination from "./Pagination";

const ORDERS_CACHE_KEY = "orders_cache";
const ORDERS_CACHE_EXPIRY_KEY = "orders_cache_expiry";
const CACHE_DURATION = 3 * 60 * 1000; // 3 хвилини

interface Order {
  id: number;
  customer_name: string;
  phone_number: string;
  email: string;
  delivery_method: string;
  city: string;
  post_office: string;
  payment_type: string;
  status: string;
  created_at: Date;
}

const options = [
  { value: "pending", label: "Очікується" },
  { value: "delivering", label: "Доставляємо" },
  { value: "complete", label: "Завершено" },
];

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const totalPages = useMemo(() => 
    Math.ceil(orders.length / ordersPerPage), 
    [orders.length]
  );

  const paginatedOrders = useMemo(() => 
    orders.slice(
      (currentPage - 1) * ordersPerPage,
      currentPage * ordersPerPage
    ),
    [orders, currentPage, ordersPerPage]
  );

  // Reset to first page if orders are changed (e.g., after deletion)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [orders, currentPage, totalPages]);

  // Функція для очищення кешу
  const clearCache = () => {
    localStorage.removeItem(ORDERS_CACHE_KEY);
    localStorage.removeItem(ORDERS_CACHE_EXPIRY_KEY);
    setLoading(true);
    window.location.reload();
  };

  async function handleDelete(orderId: number) {
    if (!confirm("Ви впевнені, що хочете видалити це замовлення?")) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete order");
      
      // Оновлюємо стан
      const updatedOrders = orders.filter((o) => o.id !== orderId);
      setOrders(updatedOrders);
      
      // Оновлюємо кеш
      localStorage.setItem(ORDERS_CACHE_KEY, JSON.stringify(updatedOrders));
      localStorage.setItem(ORDERS_CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  }

  useEffect(() => {
    async function fetchOrders() {
      try {
        // Перевірка кешу
        const cachedData = localStorage.getItem(ORDERS_CACHE_KEY);
        const cacheExpiry = localStorage.getItem(ORDERS_CACHE_EXPIRY_KEY);
        const now = Date.now();

        if (cachedData && cacheExpiry && now < parseInt(cacheExpiry)) {
          // Використовуємо кешовані дані
          console.log("Використання кешованих даних замовлень");
          setOrders(JSON.parse(cachedData));
          setLoading(false);
          return;
        }

        // Якщо кеш застарів або відсутній, завантажуємо з сервера
        console.log("Завантаження замовлень з сервера");
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        
        setOrders(data);
        
        // Зберігаємо в кеш
        localStorage.setItem(ORDERS_CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(ORDERS_CACHE_EXPIRY_KEY, (now + CACHE_DURATION).toString());
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  // Handle status change
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      // Оновлюємо стан
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      
      // Оновлюємо кеш
      localStorage.setItem(ORDERS_CACHE_KEY, JSON.stringify(updatedOrders));
      localStorage.setItem(ORDERS_CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Header with title and add button */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Замовлення
            </h2>
            <div className="flex gap-2">
              <button
                onClick={clearCache}
                className="inline-block rounded-md bg-gray-500 px-4 py-2 text-white text-sm font-medium hover:bg-gray-600 transition shadow-sm"
                title="Очистити кеш та перезавантажити дані"
              >
                🔄 Оновити
              </button>
              <Link
                href="/admin/orders/add"
                className="inline-block rounded-md bg-green-500 px-4 py-2 text-white text-sm font-medium hover:bg-green-600 transition shadow-sm"
              >
                + Додати замовлення
              </Link>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Ім&#39;я клієнта
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Номер телефону
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Е-пошта
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Спосіб доставки
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Місто
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Відділення
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Оплата
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Статус
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Створено
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Дії
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-6 text-gray-600"
                  >
                    Завантаження...
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-6 text-gray-600"
                  >
                    Замовлень не знайдено.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="px-5 py-4 text-sm text-gray-900 font-medium">
                      {order.customer_name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700">
                      {order.phone_number}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700">
                      {order.email}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700">
                      {order.delivery_method}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700">
                      {order.city}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700">
                      {order.post_office}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700">
                      {order.payment_type === "full"
                        ? "Повна"
                        : order.payment_type === "prepay"
                        ? "Передоплата"
                        : order.payment_type === "installment"
                        ? "Розсрочка"
                        : order.payment_type === "crypto"
                        ? "Крипта"
                        : "-"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="border border-gray-300 px-2 py-1 rounded text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-5 py-4 space-x-2">
                      <Link
                        href={`/admin/orders/${order.id}/edit`}
                        className="inline-block rounded-md bg-blue-500 px-3 py-1.5 text-white text-sm font-medium hover:bg-blue-600 transition shadow-sm"
                      >
                        Детальний огляд
                      </Link>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="inline-block rounded-md bg-red-500 px-3 py-1.5 text-white text-sm font-medium hover:bg-red-600 transition shadow-sm"
                      >
                        Видалити
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {!loading && orders.length > ordersPerPage && (
            <div className="flex justify-end px-5 py-4 border-t border-gray-200 bg-gray-50">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
