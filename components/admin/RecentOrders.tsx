"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "./ui/table";
import Badge from "@/components/admin/ui/badge/Badge";

interface Order {
  id: number;
  customer_name: string;
  phone_number: string;
  email: string;
  delivery_method: string;
  city: string;
  post_office: string;
  status: "Delivered" | "Pending" | "Canceled";
  created_at: Date;
}

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data.slice(0, 5));
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-300 bg-white px-4 pb-3 pt-4 shadow-sm sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Orders
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 hover:text-gray-700">
            See all
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        {loading ? (
          <p className="text-gray-600">Loading orders...</p>
        ) : error ? (
          <p className="text-red-600">Error: {error}</p>
        ) : (
          <Table>
            <TableHeader className="border-gray-200 border-y bg-gray-50">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-900 text-start text-theme-xs"
                >
                  Customer
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-900 text-start text-theme-xs"
                >
                  Delivery Method
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-900 text-start text-theme-xs"
                >
                  City / Post Office
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-900 text-start text-theme-xs"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-900 text-start text-theme-xs"
                >
                  Date
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-200 bg-white">
              {orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50">
                  <TableCell className="py-3">
                    <div className="flex flex-col">
                      <p className="font-medium text-gray-900 text-theme-sm">
                        {order.customer_name}
                      </p>
                      <span className="text-gray-600 text-theme-xs">
                        {order.email} | {order.phone_number}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-700 text-theme-sm">
                    {order.delivery_method}
                  </TableCell>
                  <TableCell className="py-3 text-gray-700 text-theme-sm">
                    {order.city} / {order.post_office}
                  </TableCell>
                  <TableCell className="py-3 text-gray-700 text-theme-sm">
                    <Badge
                      size="sm"
                      color={
                        order.status === "Delivered"
                          ? "success"
                          : order.status === "Pending"
                          ? "warning"
                          : "error"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-gray-700 text-theme-sm">
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
