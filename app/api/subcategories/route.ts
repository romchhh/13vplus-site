// /app/api/subcategories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sqlGetSubcategoriesByCategory, sqlPostSubcategory } from "@/lib/sql";
import { revalidateCategories } from "@/lib/revalidate";
import { parseProductGender } from "@/lib/productGender";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryIdParam = searchParams.get("parent_category_id");

  const categoryId = Number(categoryIdParam);
  if (!categoryIdParam || isNaN(categoryId)) {
    return NextResponse.json(
      { error: "Invalid or missing parent_category_id" },
      { status: 400 }
    );
  }

  try {
    const gender = parseProductGender(searchParams.get("gender")) ?? undefined;
    const subcategories = await sqlGetSubcategoriesByCategory(categoryId, gender);
    
    // Add cache headers: cache for 5 minutes
    return NextResponse.json(subcategories, {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Failed to get subcategories:", error);
    return NextResponse.json(
      { error: "Failed to fetch subcategories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, parent_category_id } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'name'" },
        { status: 400 }
      );
    }

    const categoryId = Number(parent_category_id);
    if (!parent_category_id || isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Missing or invalid 'parent_category_id'" },
        { status: 400 }
      );
    }

    const newSubcategory = await sqlPostSubcategory(name, categoryId);
    revalidateCategories();
    return NextResponse.json(newSubcategory, { status: 201 });
  } catch (error) {
    console.error("Failed to create subcategory:", error);
    return NextResponse.json(
      { error: "Failed to create subcategory" },
      { status: 500 }
    );
  }
}
