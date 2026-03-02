"use client";

import { useEffect, useState } from "react";
import ProductClient from "./ProductClient";
import type { Product } from "@/lib/types/product";

interface ProductClientWrapperProps {
  product: Product;
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

