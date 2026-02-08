import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBonusPercentForPurchase, getLoyaltyTierForDisplay } from "@/lib/loyalty";

/**
 * GET /api/users/loyalty
 * Повертає totalSpent, bonusPercent та tier для поточного користувача (для відображення бонусів при покупці).
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    const user = await prisma.user.findUnique({
      where: userId ? { id: userId } : { email: session.user.email ?? undefined },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const paidOrders = await prisma.order.findMany({
      where: { userId: user.id, paymentStatus: "paid" },
      select: {
        id: true,
        items: { select: { price: true, quantity: true } },
      },
    });
    const totalSpent = paidOrders.reduce((sum, order) => {
      const itemsTotal = order.items.reduce(
        (s: number, it: { price: unknown; quantity: number }) => s + Number(it.price) * it.quantity,
        0
      );
      return sum + itemsTotal;
    }, 0);

    const paidOrdersCount = paidOrders.length;
    const bonusPercent = getBonusPercentForPurchase(totalSpent, paidOrdersCount);
    const tier = getLoyaltyTierForDisplay(totalSpent, paidOrdersCount);

    return NextResponse.json({
      totalSpent,
      bonusPercent,
      tierName: tier.name,
      nextTier: tier.nextTier,
      progress: tier.progress,
    });
  } catch (error) {
    console.error("Error fetching loyalty:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
