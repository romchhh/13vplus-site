import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await params;
    const id = Number(productId);
    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
    }

    const userId = (session.user as { id?: string }).id;
    const user = await prisma.user.findUnique({
      where: userId ? { id: userId } : { email: session.user.email ?? undefined },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.wishlist.deleteMany({
      where: { userId: user.id, productId: id },
    });
    return NextResponse.json({ removed: true });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
