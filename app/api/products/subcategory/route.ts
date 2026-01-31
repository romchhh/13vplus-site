import { sqlGetProductsBySubcategoryName } from "@/lib/sql";
import { NextResponse } from "next/server";
import { apiLogger } from "@/lib/logger";

// Enable ISR for this route
export const revalidate = 1200; // 20 minutes

export async function GET(request: Request) {
  const url = new URL(request.url);
  const subcategory = url.searchParams.get("subcategory");

  try {
    if (!subcategory) {
      return NextResponse.json(
        { error: "Missing subcategory parameter" },
        { status: 400 }
      );
    }

    const products = await sqlGetProductsBySubcategoryName(subcategory);
    
    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=1200, stale-while-revalidate=2400",
      },
    });
  } catch (error) {
    apiLogger.error("GET", "/api/products/subcategory", error);
    return NextResponse.json(
      { error: "Failed to fetch products by subcategory" },
      { status: 500 }
    );
  }
}
