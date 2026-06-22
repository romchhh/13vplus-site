import { NextRequest, NextResponse } from "next/server";
import {
  sqlGetSubcategory,
  sqlPutSubcategory,
  sqlDeleteSubcategory,
} from "@/lib/sql";
import { revalidateCategories } from "@/lib/revalidate";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const subcategoryId = Number((await params).id);

  if (isNaN(subcategoryId)) {
    return NextResponse.json(
      { error: "Invalid subcategory ID" },
      { status: 400 }
    );
  }

  try {
    const subcategory = await sqlGetSubcategory(subcategoryId);

    if (!subcategory) {
      return NextResponse.json(
        { error: "Subcategory not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(subcategory);
  } catch (error) {
    console.error("GET subcategory failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const subcategoryId = Number((await params).id);

  if (isNaN(subcategoryId)) {
    return NextResponse.json(
      { error: "Invalid subcategory ID" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { name, parent_category_id } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing name" },
        { status: 400 }
      );
    }

    const categoryId = Number(parent_category_id);
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid parent_category_id" },
        { status: 400 }
      );
    }

    const updatedSubcategory = await sqlPutSubcategory(
      subcategoryId,
      name,
      categoryId
    );

    revalidateCategories();
    return NextResponse.json(updatedSubcategory);
  } catch (error) {
    console.error("PUT subcategory failed:", error);
    return NextResponse.json(
      { error: "Failed to update subcategory" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const subcategoryId = Number((await params).id);

  if (isNaN(subcategoryId)) {
    return NextResponse.json(
      { error: "Invalid subcategory ID" },
      { status: 400 }
    );
  }

  try {
    await sqlDeleteSubcategory(subcategoryId);
    revalidateCategories();
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("DELETE subcategory failed:", error);
    return NextResponse.json(
      { error: "Failed to delete subcategory" },
      { status: 500 }
    );
  }
}
