import { sqlGetAllProducts, sqlGetProductsBySeason } from "@/lib/sql";
import { NextResponse } from "next/server";
import { apiLogger } from "@/lib/logger";

// Enable ISR for this route
export const revalidate = 300; // 5 minutes

export async function GET(request: Request) {
  const url = new URL(request.url);
  const season = url.searchParams.get("season");

  try {
    let products;

    if (season) {
      products = await sqlGetProductsBySeason(season);
    } else {
      products = await sqlGetAllProducts();
    }

    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    apiLogger.error("GET", "/api/products/season", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
