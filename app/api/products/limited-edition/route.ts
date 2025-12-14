import { sqlGetLimitedEditionProducts } from "@/lib/sql";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Check for cache-busting query parameter
    const noCache = request.nextUrl.searchParams.get("nocache") === "true";
    
    const products = await sqlGetLimitedEditionProducts();
    
    console.log(`[GET /api/products/limited-edition] Returning ${products.length} products`);
    console.log(`[GET /api/products/limited-edition] Products:`, products.map(p => ({
      id: p.id,
      name: p.name,
      hasMedia: !!p.first_media
    })));
    
    const headers: HeadersInit = noCache
      ? {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        }
      : {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        };
    
    return NextResponse.json(products, { headers });
  } catch (error) {
    console.error("[GET /api/products/limited-edition]", error);
    return NextResponse.json(
      { error: "Failed to fetch limited edition products" },
      { status: 500 }
    );
  }
}

// Enable revalidation every 1 minute (reduced from 5 minutes for faster updates)
export const revalidate = 60;

