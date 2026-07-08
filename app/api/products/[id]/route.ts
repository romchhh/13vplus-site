// app/api/products/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { sqlGetProduct, sqlPutProduct, sqlDeleteProduct } from "@/lib/sql";
import { apiLogger } from "@/lib/logger";
import { revalidateProducts } from "@/lib/revalidate";
import { DEFAULT_PRODUCT_GENDER, parseProductGender } from "@/lib/productGender";

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
    const limitedEdition = body.limited_edition === true;
    const season = Array.isArray(body.season)
      ? body.season
      : typeof body.season === "string"
      ? [body.season]
      : [];
    const categoryId = body.category_id ? Number(body.category_id) : null;
    const subcategoryId = body.subcategory_id
      ? Number(body.subcategory_id)
      : null;
    const color = typeof body.color === "string" ? body.color : null;
    const oldPrice = body.old_price ? Number(body.old_price) : null;
    const discountPercentage = body.discount_percentage
      ? Number(body.discount_percentage)
      : null;
    const priority = body.priority ? Number(body.priority) : 0;
    const hasLining = body.has_lining === true;
    const liningDescription = body.lining_description || "";

    console.log("[PUT /api/products/:id] Updating product:", {
      id,
      limited_edition: body.limited_edition,
      limitedEdition: limitedEdition,
      top_sale: body.top_sale,
      topSale,
    });

    const wholesalePrice =
      body.wholesale_price !== null && body.wholesale_price !== undefined
        ? Number(body.wholesale_price)
        : null;

    await sqlPutProduct(id, {
      name: body.name,
      description: body.description,
      price: body.price,
      wholesale_price:
        wholesalePrice !== null && !Number.isNaN(wholesalePrice)
          ? wholesalePrice
          : null,
      old_price: oldPrice,
      discount_percentage: discountPercentage,
      priority,
      top_sale: topSale,
      limited_edition: limitedEdition,
      season,
      color,
      category_id: categoryId,
      subcategory_id: subcategoryId,
      gender: parseProductGender(body.gender) ?? DEFAULT_PRODUCT_GENDER,
      sizes: Array.isArray(body.sizes)
        ? body.sizes.map(
            (s: string | { size: string; stock?: number }) =>
              typeof s === "string"
                ? { size: s, stock: 0 }
                : { size: s.size, stock: Number(s.stock ?? 0) }
          )
        : [],
      media: Array.isArray(body.media) ? body.media : [],
      colors: Array.isArray(body.colors)
        ? body.colors.map((c: { label: string; hex?: string | null }) => ({
            label: c.label,
            hex: c.hex || null,
          }))
        : [],
      has_lining: hasLining,
      fabric_composition: body.fabric_composition,
      lining_description: liningDescription,
      weight_kg:
        body.weight_kg !== null &&
        body.weight_kg !== undefined &&
        body.weight_kg !== ""
          ? Number(body.weight_kg)
          : null,
      length_cm:
        body.length_cm !== null &&
        body.length_cm !== undefined &&
        body.length_cm !== ""
          ? Number(body.length_cm)
          : null,
      width_cm:
        body.width_cm !== null &&
        body.width_cm !== undefined &&
        body.width_cm !== ""
          ? Number(body.width_cm)
          : null,
      height_cm:
        body.height_cm !== null &&
        body.height_cm !== undefined &&
        body.height_cm !== ""
          ? Number(body.height_cm)
          : null,
      unit_type: typeof body.unit_type === "string" ? body.unit_type : "шт",
      currency_code:
        typeof body.currency_code === "string" ? body.currency_code : "UAH",
      has_multiple_variants:
        typeof body.has_multiple_variants === "boolean"
          ? body.has_multiple_variants
          : true,
      variant_property_name:
        typeof body.variant_property_name === "string"
          ? body.variant_property_name
          : "Колір",
      extra_fields:
        typeof body.extra_fields === "string" ? body.extra_fields : null,
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
