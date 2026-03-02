import { NextRequest, NextResponse } from "next/server";
import {
  sqlGetCategoryBySlug,
  sqlPutCategory,
  sqlDeleteCategory,
} from "@/lib/sql";
import { revalidateCategories } from "@/lib/revalidate";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const slug = decodeURIComponent((await params).slug);

  if (!slug) {
    return NextResponse.json(
      { error: "Invalid category slug" },
      { status: 400 }
    );
  }

  try {
    const result = await sqlGetCategoryBySlug(slug);
    if (!result) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/categories/:slug]", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const slug = decodeURIComponent((await params).slug);

  if (!slug) {
    return NextResponse.json(
      { error: "Invalid category slug" },
      { status: 400 }
    );
  }

  try {
    const existing = await sqlGetCategoryBySlug(slug);
    if (!existing) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { name, priority, mediaType, mediaUrl } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }
    if (
      priority !== undefined &&
      (typeof priority !== "number" || priority < 0)
    ) {
      return NextResponse.json(
        { error: "Priority must be a non-negative number" },
        { status: 400 }
      );
    }

    const updated = await sqlPutCategory(
      existing.id,
      name,
      priority ?? 0,
      mediaType,
      mediaUrl
    );
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/categories/:slug]", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const slug = decodeURIComponent((await params).slug);

  if (!slug) {
    return NextResponse.json(
      { error: "Invalid category slug" },
      { status: 400 }
    );
  }

  try {
    const existing = await sqlGetCategoryBySlug(slug);
    if (!existing) {
      // Якщо категорії вже немає в БД — вважаємо видалення успішним (idempotent DELETE)
      return NextResponse.json({ deleted: true, alreadyDeleted: true });
    }

    await sqlDeleteCategory(existing.id);
    await revalidateCategories();
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("[DELETE /api/categories/:slug]", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
