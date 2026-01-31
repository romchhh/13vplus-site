import { sqlGetTopSaleProducts } from "@/lib/sql";
import { NextResponse } from "next/server";
import { apiLogger } from "@/lib/logger";

// Enable ISR for this route
export const revalidate = 300; // 5 minutes

export async function GET() {
  try {
    const products = await sqlGetTopSaleProducts();
    
    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    apiLogger.error("GET", "/api/products/top-sale", error);
    return NextResponse.json(
      { error: "Failed to fetch top sale products" },
      { status: 500 }
    );
  }
}

