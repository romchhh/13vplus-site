import { sqlGetLimitedEditionProducts } from "@/lib/sql";
import { NextResponse } from "next/server";
import { apiLogger } from "@/lib/logger";

// Enable ISR for this route
export const revalidate = 1200; // 20 minutes
export const dynamic = 'force-static';

export async function GET() {
  try {
    const products = await sqlGetLimitedEditionProducts();
    
    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=1200, stale-while-revalidate=2400",
      },
    });
  } catch (error) {
    apiLogger.error("GET", "/api/products/limited-edition", error);
    return NextResponse.json(
      { error: "Failed to fetch limited edition products" },
      { status: 500 }
    );
  }
}

