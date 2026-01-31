import { sqlGetAllProducts, sqlGetProductsByCategory } from "@/lib/sql";
import { NextResponse } from "next/server";
import { apiLogger } from "@/lib/logger";

// Enable ISR for this route
export const revalidate = 1200; // 20 minutes

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");

  try {
    let products;
    if (category) {
      products = await sqlGetProductsByCategory(category);
    } else {
      products = await sqlGetAllProducts();
    }

    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=1200, stale-while-revalidate=2400",
      },
    });
  } catch (error) {
    apiLogger.error("GET", "/api/products/category", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
