import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    const user = await prisma.user.findUnique({
      where: userId ? { id: userId } : { email: session.user.email ?? undefined },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const orderId = parseInt(id, 10);
    if (!Number.isFinite(orderId)) {
      return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                media: {
                  orderBy: { id: "asc" },
                  take: 5,
                  select: { url: true, type: true },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Same shape as basket/FinalCard: product with imageUrl (first photo url)
    const orderWithImageUrl = {
      ...order,
      items: order.items.map((item) => {
        const product = item.product as { id: number; name: string; media?: { url: string; type: string }[] } | null;
        const firstPhoto = product?.media?.find((m) => m.type === "photo");
        const imageUrl = firstPhoto?.url ?? product?.media?.[0]?.url ?? null;
        return {
          ...item,
          product: product
            ? { id: product.id, name: product.name, imageUrl }
            : null,
        };
      }),
    };

    return NextResponse.json(orderWithImageUrl);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
