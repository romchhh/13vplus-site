// app/api/products/route.ts

import { NextResponse } from "next/server";
import { sqlGetAllProducts, sqlPostProduct } from "@/lib/sql";
import { prisma } from "@/lib/prisma";
import {
  pushProductToKeyCrm,
  shouldPushProductToKeyCrmOnAdminSave,
} from "@/lib/keycrm-push-product";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { apiLogger } from "@/lib/logger";
import { DEFAULT_PRODUCT_GENDER, parseProductGender } from "@/lib/productGender";

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
        description,
        price,
        wholesale_price = null,
        old_price,
        discount_percentage,
        priority = 0,
        sizes = [],
        media = [],
        colors = [],
        top_sale = false,
        limited_ition, // backward compat typo handling (ignored)
        limited_edition = false,
        season = [],
        color,
        category_id = null,
        subcategory_id = null,
        gender = DEFAULT_PRODUCT_GENDER,
        fabric_composition = "",
        has_lining = false,
        lining_description = "",
        weight_kg = null,
        length_cm = null,
        width_cm = null,
        height_cm = null,
        unit_type = "шт",
        currency_code = "UAH",
        has_multiple_variants = true,
        variant_property_name = "Колір",
        extra_fields = null,
      } = body || {};

      if (!name || typeof price !== "number") {
        return NextResponse.json(
          { error: "Missing required fields: name, price" },
          { status: 400 }
        );
      }

      const product = await sqlPostProduct({
        name,
        description,
        price,
        wholesale_price:
          wholesale_price !== null && wholesale_price !== undefined
            ? Number(wholesale_price)
            : null,
        old_price,
        discount_percentage,
        priority,
        sizes: Array.isArray(sizes)
          ? (sizes as (string | { size: string; stock?: number | string })[]).map((s) =>
              typeof s === "string" ? { size: s, stock: 0 } : { size: s.size, stock: Number(s.stock ?? 0) }
            )
          : [],
        media,
        top_sale,
        limited_edition:
          typeof limited_ition === "boolean" ? limited_ition : limited_edition,
        season,
        color,
        category_id,
        subcategory_id,
        gender: parseProductGender(gender) ?? DEFAULT_PRODUCT_GENDER,
        fabric_composition,
        has_lining,
        lining_description,
        weight_kg:
          weight_kg !== null && weight_kg !== undefined && weight_kg !== ""
            ? Number(weight_kg)
            : null,
        length_cm:
          length_cm !== null && length_cm !== undefined && length_cm !== ""
            ? Number(length_cm)
            : null,
        width_cm:
          width_cm !== null && width_cm !== undefined && width_cm !== ""
            ? Number(width_cm)
            : null,
        height_cm:
          height_cm !== null && height_cm !== undefined && height_cm !== ""
            ? Number(height_cm)
            : null,
        unit_type: typeof unit_type === "string" ? unit_type : "шт",
        currency_code: typeof currency_code === "string" ? currency_code : "UAH",
        has_multiple_variants:
          typeof has_multiple_variants === "boolean"
            ? has_multiple_variants
            : true,
        variant_property_name:
          typeof variant_property_name === "string"
            ? variant_property_name
            : "Колір",
        extra_fields:
          typeof extra_fields === "string" ? extra_fields : null,
        colors,
      });

      if (shouldPushProductToKeyCrmOnAdminSave()) {
        void pushProductToKeyCrm(prisma, product.id).catch((err) => {
          apiLogger.error("KeyCRM", `push product ${product.id}`, err);
        });
      }

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
    const sizesRaw = formData.get("sizes") as string;
    const images = formData.getAll("images") as File[];
    const topSale = formData.get("top_sale") === "true";
    const limitedEdition = formData.get("limited_edition") === "true";
    const color = formData.get("color")?.toString();
    const seasonsRaw = formData.get("seasons") as string | null;
    const season = seasonsRaw ? seasonsRaw.split(",").map((s) => s.trim()) : [];
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

    const parsedSizes = JSON.parse(sizesRaw); // ["S", "M", "L"]

    const product = await sqlPostProduct({
      name,
      description,
      price,
      old_price: oldPrice,
      discount_percentage: discountPercentage,
      priority,
      top_sale: topSale,
      limited_edition: limitedEdition,
      season,
      color,
      category_id: categoryId,
      subcategory_id: subcategoryId,
      fabric_composition: fabricComposition,
      has_lining: hasLining,
      lining_description: liningDescription,
      sizes: parsedSizes.map((size: string) => ({
        size,
        stock: 5,
      })),
      media: savedMedia,
    });

    if (shouldPushProductToKeyCrmOnAdminSave()) {
      void pushProductToKeyCrm(prisma, product.id).catch((err) => {
        apiLogger.error("KeyCRM", `push product ${product.id}`, err);
      });
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    apiLogger.error("POST", "/api/products", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
