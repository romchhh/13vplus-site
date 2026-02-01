"use client";

import React, { useEffect, useState } from "react";
import {
  BoxIconLine,
  GroupIcon,
  DollarLineIcon,
} from "../../public/admin-icons/index";

export const EcommerceMetrics = () => {
  const [ordersCount, setOrdersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [prepaidAmount, setPrepaidAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const productsRes = await fetch("/api/products");
      const ordersRes = await fetch("/api/orders");

      const products = await productsRes.json();
      const orders = await ordersRes.json();

      setProductsCount(products.length);
      setOrdersCount(orders.length);

      // Розрахунок статистики по грошам
      let totalRev = 0;
      let prepaid = 0;
      let remaining = 0;

      for (const order of orders) {
        // Завантажити деталі замовлення з товарами
        const orderDetailsRes = await fetch(`/api/orders/${order.id}`);
        const orderDetails = await orderDetailsRes.json();

        // Розрахувати загальну суму замовлення
        const orderTotal = orderDetails.items.reduce(
          (sum: number, item: { price: string; quantity: number }) =>
            sum + parseFloat(item.price) * item.quantity,
          0
        );

        totalRev += orderTotal;

        // Розрахунок передоплати та залишку
        if (orderDetails.payment_type === "prepay") {
          prepaid += 200;
          remaining += Math.max(0, orderTotal - 200);
        } else if (orderDetails.payment_type === "full") {
          prepaid += orderTotal;
          // remaining залишається 0
        }
      }

      setTotalRevenue(totalRev);
      setPrepaidAmount(prepaid);
      setRemainingAmount(remaining);
    }

    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl">
          <GroupIcon className="text-gray-900 size-6" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-600">
              Замовлень
            </span>
            <h4 className="mt-2 font-bold text-gray-900 text-title-sm">
              {ordersCount}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl">
          <BoxIconLine className="text-gray-900" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-600">
              Продуктів
            </span>
            <h4 className="mt-2 font-bold text-gray-900 text-title-sm">
              {productsCount}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Total Revenue Metric --> */}
      <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl">
          <DollarLineIcon className="text-green-600 size-6" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-600">
              Загальна сума
            </span>
            <h4 className="mt-2 font-bold text-gray-900 text-title-sm">
              {totalRevenue.toFixed(2)} ₴
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Prepaid Amount Metric --> */}
      <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
          <DollarLineIcon className="text-blue-600 size-6" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-600">
              Оплачено
            </span>
            <h4 className="mt-2 font-bold text-gray-900 text-title-sm">
              {prepaidAmount.toFixed(2)} ₴
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Remaining Amount Metric --> */}
      <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl">
          <DollarLineIcon className="text-orange-600 size-6" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-600">
              Залишок до оплати
            </span>
            <h4 className="mt-2 font-bold text-gray-900 text-title-sm">
              {remainingAmount.toFixed(2)} ₴
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
};
