import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id, paymentStatus: "paid" },
      include: {
        items: {
          include: {
            product: {
              select: {
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
      orderBy: { createdAt: "desc" },
    });

    // Same shape as basket/FinalCard: product with imageUrl (first photo url)
    const ordersWithImageUrl = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => {
        const product = item.product as { name: string; media?: { url: string; type: string }[] } | null;
        const firstPhoto = product?.media?.find((m) => m.type === "photo");
        const imageUrl = firstPhoto?.url ?? product?.media?.[0]?.url ?? null;
        return {
          ...item,
          product: product
            ? { name: product.name, imageUrl }
            : null,
        };
      }),
    }));

    return NextResponse.json(ordersWithImageUrl);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
