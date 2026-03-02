// app/api/products/route.ts

import { NextResponse } from "next/server";
import { sqlGetAllProducts, sqlPostProduct } from "@/lib/sql";
import { revalidateProducts } from "@/lib/revalidate";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { apiLogger } from "@/lib/logger";

// Helper function to determine file type
function getFileType(mimeType: string, filename: string): "photo" | "video" {
  // Check MIME type first
  if (mimeType.startsWith("video/")) {
    return "video";
  }

  // Fallback: check file extension if MIME type is generic or unknown
  const ext = filename.split(".").pop()?.toLowerCase();
  const videoExtensions = [
    "mp4",
    "webm",
    "ogg",
    "mov",
    "avi",
    "mkv",
    "flv",
    "wmv",
  ];

  if (ext && videoExtensions.includes(ext)) {
    return "video";
  }

  return "photo";
}

// =========================
// GET /api/products
// =========================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    let products = await sqlGetAllProducts();

    // Mobile pagination for better performance
    if (limit) {
      const limitNum = parseInt(limit);
      const offsetNum = parseInt(offset || "0");
      products = products.slice(offsetNum, offsetNum + limitNum);
    }

    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=1200, stale-while-revalidate=2400",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    apiLogger.error("GET", "/api/products", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// Enable revalidation every 20 minutes
export const revalidate = 1200;

// =========================
// POST /api/products
// =========================
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // JSON flow: expects media already uploaded via /api/images
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const {
        name,
        subtitle,
        release_form,
        course,
        package_weight,
        main_info,
        short_description,
        description,
        main_action,
        indications_for_use,
        benefits,
        full_composition,
        usage_method,
        contraindications,
        storage_conditions,
        price,
        old_price,
        discount_percentage,
        priority = 0,
        stock = 0,
        media = [],
        top_sale = false,
        in_stock = true,
        limited_ition,
        limited_edition = false,
        category_id = null,
        subcategory_id = null,
        fabric_composition,
        has_lining = false,
        lining_description,
      } = body || {};

      if (!name || typeof price !== "number") {
        return NextResponse.json(
          { error: "Missing required fields: name, price" },
          { status: 400 }
        );
      }

      const product = await sqlPostProduct({
        name,
        subtitle: subtitle ?? null,
        release_form: release_form ?? null,
        course: course ?? null,
        package_weight: package_weight ?? null,
        main_info: main_info ?? null,
        short_description: short_description ?? null,
        description: description ?? null,
        main_action: main_action ?? null,
        indications_for_use: indications_for_use ?? null,
        benefits: benefits ?? null,
        full_composition: full_composition ?? null,
        usage_method: usage_method ?? null,
        contraindications: contraindications ?? null,
        storage_conditions: storage_conditions ?? null,
        price,
        old_price,
        discount_percentage,
        priority,
        stock: typeof stock === "number" ? stock : Number(stock) || 0,
        media,
        top_sale,
        in_stock: in_stock !== false,
        limited_edition:
          typeof limited_ition === "boolean" ? limited_ition : limited_edition,
        category_id,
        subcategory_id,
        fabric_composition: fabric_composition ?? null,
        has_lining,
        lining_description: lining_description ?? null,
      });

      await revalidateProducts();
      return NextResponse.json(product, { status: 201 });
    }

    // Multipart form fallback
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const price = Number(formData.get("price"));
    const oldPrice = formData.get("old_price")
      ? Number(formData.get("old_price"))
      : null;
    const discountPercentage = formData.get("discount_percentage")
      ? Number(formData.get("discount_percentage"))
      : null;
    const priority = formData.get("priority")
      ? Number(formData.get("priority"))
      : 0;
    const description = formData.get("description") as string;
    const stockRaw = formData.get("stock");
    const stock = stockRaw != null ? Number(stockRaw) || 0 : 0;
    const images = formData.getAll("images") as File[];
    const topSale = formData.get("top_sale") === "true";
    const limitedEdition = formData.get("limited_edition") === "true";
    const categoryId = formData.get("category_id")
      ? Number(formData.get("category_id"))
      : null;
    const subcategoryId = formData.get("subcategory_id")
      ? Number(formData.get("subcategory_id"))
      : null;
    const fabricComposition =
      formData.get("fabric_composition")?.toString() || "";
    const hasLining = formData.get("has_lining") === "true";
    const liningDescription =
      formData.get("lining_description")?.toString() || "";

    if (!name || !price) {
      return NextResponse.json(
        { error: "Missing required fields: name, price" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "product-images");
    await mkdir(uploadDir, { recursive: true });

    const savedMedia: { type: "photo" | "video"; url: string }[] = [];

    for (const image of images) {
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const ext = image.name.split(".").pop();
      const uniqueName = `${crypto.randomUUID()}.${ext}`;
      const filePath = path.join(uploadDir, uniqueName);

      await writeFile(filePath, buffer);

      const fileType = getFileType(image.type, image.name);
      apiLogger.info("POST", `/api/products`, `File: ${image.name}, MIME: ${image.type}, Type: ${fileType}`);

      savedMedia.push({ type: fileType, url: uniqueName });
    }

    apiLogger.info("POST", `/api/products`, `Media to save: ${savedMedia.length} files`);

    const product = await sqlPostProduct({
      name,
      description,
      price,
      old_price: oldPrice,
      discount_percentage: discountPercentage,
      priority,
      stock,
      top_sale: topSale,
      limited_edition: limitedEdition,
      category_id: categoryId,
      subcategory_id: subcategoryId,
      fabric_composition: fabricComposition,
      has_lining: hasLining,
      lining_description: liningDescription,
      media: savedMedia,
    });

    await revalidateProducts();
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    apiLogger.error("POST", "/api/products", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
