import { NextRequest, NextResponse } from "next/server";
import { sqlGetCategory, sqlPutCategory, sqlDeleteCategory } from "@/lib/sql";

// ========================
// GET /api/categories/:id
// ========================
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = Number((await params).id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
  }

  try {
    const result = await sqlGetCategory(id);
    if (!result) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/categories/:id]", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// ========================
// PUT /api/categories/:id
// ========================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = Number((await params).id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { name, priority, mediaType, mediaUrl } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }
    // Optional: Validate priority is a number (integer >= 0)
    if (
      priority !== undefined &&
      (typeof priority !== "number" || priority < 0)
    ) {
      return NextResponse.json(
        { error: "Priority must be a non-negative number" },
        { status: 400 }
      );
    }

    // Default priority to 0 if undefined
    const updated = await sqlPutCategory(id, name, priority ?? 0, mediaType, mediaUrl);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/categories/:id]", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// ========================
// DELETE /api/categories/:id
// ========================
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = Number((await params).id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
  }

  try {
    await sqlDeleteCategory(id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("[DELETE /api/categories/:id]", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
