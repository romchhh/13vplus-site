// app/api/products/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { sqlGetProduct, sqlPutProduct, sqlDeleteProduct } from "@/lib/sql";
import { apiLogger } from "@/lib/logger";
import { revalidateProducts } from "@/lib/revalidate";

// Enable ISR for this route
export const revalidate = 1200; // 20 minutes

// =========================
// GET /api/products/[id]
// =========================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = Number((await params).id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const product = await sqlGetProduct(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product, {
      headers: {
        "Cache-Control": "public, s-maxage=1200, stale-while-revalidate=2400",
      },
    });
  } catch (error) {
    apiLogger.error("GET", `/api/products/${(await params).id}`, error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// =========================
// PUT /api/products/[id]
// =========================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = Number((await params).id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: "Missing required fields: name, price" },
        { status: 400 }
      );
    }

    const topSale = body.top_sale === true;
    const inStock = body.in_stock !== false;
    const limitedEdition = body.limited_edition === true;
    const categoryId = body.category_id ? Number(body.category_id) : null;
    const subcategoryId = body.subcategory_id
      ? Number(body.subcategory_id)
      : null;
    const oldPrice = body.old_price ? Number(body.old_price) : null;
    const discountPercentage = body.discount_percentage
      ? Number(body.discount_percentage)
      : null;
    const priority = body.priority ? Number(body.priority) : 0;
    const hasLining = body.has_lining === true;
    const liningDescription = body.lining_description || "";
    const stock = typeof body.stock === "number" ? body.stock : body.stock != null ? Number(body.stock) : undefined;

    await sqlPutProduct(id, {
      name: body.name,
      subtitle: body.subtitle ?? undefined,
      release_form: body.release_form ?? undefined,
      course: body.course ?? undefined,
      package_weight: body.package_weight ?? undefined,
      main_info: body.main_info ?? undefined,
      short_description: body.short_description ?? undefined,
      description: body.description ?? undefined,
      main_action: body.main_action ?? undefined,
      indications_for_use: body.indications_for_use ?? undefined,
      benefits: body.benefits ?? undefined,
      full_composition: body.full_composition ?? undefined,
      usage_method: body.usage_method ?? undefined,
      contraindications: body.contraindications ?? undefined,
      storage_conditions: body.storage_conditions ?? undefined,
      price: body.price,
      old_price: oldPrice,
      discount_percentage: discountPercentage,
      priority,
      top_sale: topSale,
      in_stock: inStock,
      limited_edition: limitedEdition,
      stock,
      category_id: categoryId,
      subcategory_id: subcategoryId,
      media: Array.isArray(body.media) ? body.media : [],
      has_lining: hasLining,
      fabric_composition: body.fabric_composition ?? undefined,
      lining_description: liningDescription,
    });

    // Revalidate cache after updating product
    await revalidateProducts();

    return NextResponse.json({ updated: true });
  } catch (error) {
    apiLogger.error("PUT", `/api/products/${(await params).id}`, error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// =========================
// DELETE /api/products/[id]
// =========================
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = Number((await params).id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    await sqlDeleteProduct(id);
    
    // Revalidate cache after deleting product
    await revalidateProducts();
    
    return NextResponse.json({ deleted: true });
  } catch (error) {
    apiLogger.error("DELETE", `/api/products/${(await params).id}`, error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
