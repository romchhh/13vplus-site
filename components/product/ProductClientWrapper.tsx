"use client";

import { useEffect, useState } from "react";
import ProductClient from "./ProductClient";

interface ProductClientWrapperProps {
  product: {
    id: number;
    name: string;
    price: number;
    old_price?: number | null;
    discount_percentage?: number | null;
    description?: string | null;
    media?: { url: string; type: string }[];
    sizes?: { size: string; stock: number }[];
    colors?: { label: string; hex?: string | null }[];
    fabric_composition?: string | null;
    has_lining?: boolean;
    lining_description?: string | null;
  };
}

export default function ProductClientWrapper({ product }: ProductClientWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only render ProductClient after component is mounted on client
  // This ensures BasketProvider context is available
  if (!isMounted) {
    return (
      <div className="max-w-[1920px] w-full mx-auto">
        <div className="flex flex-col lg:flex-row justify-around p-4 md:p-10 gap-10">
          <div className="w-full lg:w-1/2 h-[600px] bg-gray-100 animate-pulse rounded"></div>
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="h-8 bg-gray-100 animate-pulse rounded"></div>
            <div className="h-12 bg-gray-100 animate-pulse rounded"></div>
            <div className="h-40 bg-gray-100 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return <ProductClient product={product} />;
}

