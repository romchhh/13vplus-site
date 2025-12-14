import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = body; // Array of { product_id, size, quantity }

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Items must be an array" },
        { status: 400 }
      );
    }

    const stockChecks = await Promise.all(
      items.map(async (item: { product_id: number; size: string; quantity: number }) => {
        const productSize = await prisma.productSize.findFirst({
          where: {
            productId: item.product_id,
            size: item.size,
          },
        });

        const availableStock = productSize?.stock ?? 0;
        const requestedQuantity = item.quantity;

        return {
          product_id: item.product_id,
          size: item.size,
          requested: requestedQuantity,
          available: availableStock,
          sufficient: availableStock >= requestedQuantity,
        };
      })
    );

    const insufficientItems = stockChecks.filter((check) => !check.sufficient);

    if (insufficientItems.length > 0) {
      return NextResponse.json(
        {
          error: "Insufficient stock",
          insufficientItems,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, stockChecks });
  } catch (error) {
    console.error("Error checking stock:", error);
    return NextResponse.json(
      { error: "Failed to check stock" },
      { status: 500 }
    );
  }
}
