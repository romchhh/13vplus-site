import { NextResponse } from "next/server";

// GET /api/colors — deprecated: products no longer have color variants. Returns empty array.
export async function GET() {
  return NextResponse.json([], {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
    },
  });
}

export const revalidate = 600;
