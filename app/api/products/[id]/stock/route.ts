import { NextRequest, NextResponse } from "next/server";
import { sqlGetProduct } from "@/lib/sql";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const product = await sqlGetProduct(Number(id));

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ stock: product.stock ?? 0 });
  } catch (error) {
    console.error("Error fetching product stock:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock information" },
      { status: 500 }
    );
  }
}
