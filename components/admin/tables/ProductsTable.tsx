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
import Image from "next/image";
import Pagination from "./Pagination";
import { getProductImageSrc } from "@/lib/getFirstProductImage";

const SIZE_MAP: Record<string, string> = {
  "1": "XL",
  "2": "L",
  "3": "M",
  "4": "S",
  "5": "XS",
};

const CACHE_KEY = "products_cache";
const CACHE_EXPIRY_KEY = "products_cache_expiry";
const CACHE_DURATION = 5 * 60 * 1000; // 5 хвилин

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  created_at: Date;
  sizes: { size: string }[];
  top_sale?: boolean;
  limited_edition?: boolean;
  category_name?: string;
  color: string;
  first_media?: { url: string; type: string } | null;
}

export default function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  const totalPages = useMemo(
    () => Math.ceil(products.length / productsPerPage),
    [products.length]
  );

  const paginatedProducts = useMemo(
    () =>
      products.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
      ),
    [products, currentPage, productsPerPage]
  );

  // Reset to first page if orders are changed (e.g., after deletion)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [products, currentPage, totalPages]);

  // Функція для очищення кешу
  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_EXPIRY_KEY);
    setLoading(true);
    window.location.reload();
  };

  async function handleDelete(productId: number) {
    if (!confirm("Ви впевнені, що хочете видалити цей продукт?")) return;
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.error || "Не вдалося видалити товар";
        alert(errorMessage);
        return;
      }

      // Оновлюємо стан
      const updatedProducts = products.filter((p) => p.id !== productId);
      setProducts(updatedProducts);

      // Оновлюємо кеш
      localStorage.setItem(CACHE_KEY, JSON.stringify(updatedProducts));
      localStorage.setItem(
        CACHE_EXPIRY_KEY,
        (Date.now() + CACHE_DURATION).toString()
      );
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Помилка при видаленні товару. Спробуйте ще раз.");
    }
  }

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data);
        const now = Date.now();
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(
          CACHE_EXPIRY_KEY,
          (now + CACHE_DURATION).toString()
        );
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Продукти
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
                href="/admin/products/add"
                className="inline-block rounded-md bg-green-500 px-4 py-2 text-white text-sm font-medium hover:bg-green-600 transition shadow-sm"
              >
                + Додати продукт
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
                  Фото
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Назва
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Опис
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Ціна
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Розміри
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Категорія
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Колір
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Бестселлер
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
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-6 text-gray-600"
                  >
                    Продуктів не знайдено.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="px-5 py-4">
                      {product.first_media ? (
                        <div className="relative w-12 h-12">
                          <Image
                            src={getProductImageSrc(product.first_media)}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="object-cover rounded"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-900 font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 max-w-[360px]">
                      {(product.description || "").length > 20
                        ? `${product.description.slice(0, 20)}…`
                        : product.description}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 font-medium">
                      {product.price} ₴
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700">
                      {product.sizes && product.sizes.length > 0
                        ? product.sizes
                            .map((s) => SIZE_MAP[s.size] || s.size)
                            .join(", ")
                        : "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700">
                      {product.category_name || "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700">
                      {product.color || "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700">
                      {product.top_sale ? "✅" : "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700">
                      {new Date(product.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-5 py-4 space-x-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-block rounded-md bg-blue-500 px-3 py-1.5 text-white text-sm font-medium hover:bg-blue-600 transition shadow-sm"
                      >
                        Редагувати
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
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
          {!loading && products.length > productsPerPage && (
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
