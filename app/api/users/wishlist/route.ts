import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const full = searchParams.get("full") === "1";

    const userId = (session.user as { id?: string }).id;
    const user = await prisma.user.findUnique({
      where: userId ? { id: userId } : { email: session.user.email ?? undefined },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (full) {
      const wishlistItems = await prisma.wishlist.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              discountPercentage: true,
              media: {
                orderBy: { id: "asc" },
                take: 1,
                select: { url: true, type: true },
              },
            },
          },
        },
      });
      const products = wishlistItems
        .filter((w) => w.product != null)
        .map((w) => {
          const p = w.product!;
          const firstMedia = p.media?.[0];
          return {
            id: p.id,
            name: p.name,
            price: Number(p.price),
            discount_percentage: p.discountPercentage,
            first_media: firstMedia
              ? { url: firstMedia.url, type: firstMedia.type }
              : null,
          };
        });
      return NextResponse.json(products);
    }

    const wishlist = await (prisma as { wishlist: { findMany: (args: unknown) => Promise<{ productId: number }[]> } }).wishlist.findMany({
      where: { userId: user.id },
      select: { productId: true },
    });
    const productIds = wishlist.map((w) => w.productId);
    return NextResponse.json({ productIds });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let productId: number = 0;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    productId = Number(body.productId);
    if (!Number.isInteger(productId) || productId < 1) {
      return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
    }

    const userIdFromSession = (session.user as { id?: string }).id;
    const user = await prisma.user.findUnique({
      where: userIdFromSession ? { id: userIdFromSession } : { email: session.user.email ?? undefined },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.wishlist.create({
      data: { userId: user.id, productId },
    });
    return NextResponse.json({ productId });
  } catch (error: unknown) {
    const e = error as { code?: string };
    if (e?.code === "P2002") {
      return NextResponse.json({ productId: productId }); // already in wishlist
    }
    console.error("Error adding to wishlist:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
