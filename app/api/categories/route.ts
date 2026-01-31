import { NextRequest, NextResponse } from "next/server";
import { sqlGetAllCategories, sqlPostCategory } from "@/lib/sql";

// ========================
// GET /api/categories
// ========================
export async function GET() {
  try {
    const categories = await sqlGetAllCategories();
    
    // Add cache headers: cache for 5 minutes
    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error("[GET /api/categories]", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// ========================
// POST /api/categories
// ========================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, priority, mediaType, mediaUrl } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const newCategory = await sqlPostCategory(
      name, 
      priority ?? 0,
      mediaType || null,
      mediaUrl || null
    );
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("[POST /api/categories]", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
