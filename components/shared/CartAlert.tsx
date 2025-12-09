"use client";

import React from "react";

interface CartAlertProps {
  isVisible: boolean;
  onGoToCart: () => void;
}

export default function CartAlert({ isVisible, onGoToCart }: CartAlertProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-black text-white px-6 py-4 sm:px-8 sm:py-5 rounded-lg shadow-2xl min-w-[280px] sm:min-w-[320px]">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm sm:text-base font-['Montserrat']">
          Товар додано в кошик
        </span>
        <button
          onClick={onGoToCart}
          className="text-sm sm:text-base font-['Montserrat'] underline hover:no-underline transition-all cursor-pointer whitespace-nowrap"
        >
          Перейти
        </button>
      </div>
    </div>
  );
}

