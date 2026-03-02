import { NextResponse } from "next/server";

// GET /api/products/related-colors — deprecated: products no longer have color variants. Returns empty array.
export async function GET() {
  return NextResponse.json([], {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "Content-Type": "application/json",
    },
  });
}
