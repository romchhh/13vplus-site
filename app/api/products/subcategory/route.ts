import { sqlGetProductsBySubcategoryName } from "@/lib/sql";
import { NextResponse } from "next/server";
import { apiLogger } from "@/lib/logger";

// Enable ISR for this route
export const revalidate = 300; // 5 minutes

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
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
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
