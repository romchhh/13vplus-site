import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        clothingSize: true,
        birthDate: true,
        bonusPoints: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          },
        },
        _count: {
          select: {
            wishlist: true,
            orders: true,
          },
        },
        orders: {
          where: { paymentStatus: "paid" },
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true,
            customerName: true,
            email: true,
            phoneNumber: true,
            city: true,
            postOffice: true,
            paymentStatus: true,
            status: true,
            invoiceId: true,
            createdAt: true,
            items: {
              select: {
                id: true,
                size: true,
                quantity: true,
                price: true,
                color: true,
                product: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Користувача не знайдено" }, { status: 404 });
    }

    // Загальна сума всіх оплачених замовлень та дата першого замовлення
    let totalSpent = 0;
    let firstOrderAt: string | null = null;
    if (user._count.orders > 0) {
      const [allItems, firstOrder] = await Promise.all([
        prisma.orderItem.findMany({
          where: { order: { userId: id, paymentStatus: "paid" } },
          select: { price: true, quantity: true },
        }),
        prisma.order.findFirst({
          where: { userId: id, paymentStatus: "paid" },
          orderBy: { createdAt: "asc" },
          select: { createdAt: true },
        }),
      ]);
      totalSpent = allItems.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
      firstOrderAt = firstOrder?.createdAt.toISOString() ?? null;
    }

    return NextResponse.json({
      ...user,
      totalSpent: Math.round(totalSpent * 100) / 100,
      firstOrderAt,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { bonusPoints, addBonusPoints } = body;

    if (bonusPoints !== undefined) {
      const value = Number(bonusPoints);
      if (!Number.isInteger(value) || value < 0) {
        return NextResponse.json(
          { error: "Бонусні бали мають бути невід'ємним цілим числом" },
          { status: 400 }
        );
      }
      const updated = await prisma.user.update({
        where: { id },
        data: { bonusPoints: value },
        select: { id: true, bonusPoints: true },
      });
      return NextResponse.json(updated);
    }

    if (addBonusPoints !== undefined) {
      const delta = Number(addBonusPoints);
      if (!Number.isInteger(delta)) {
        return NextResponse.json(
          { error: "Значення має бути цілим числом" },
          { status: 400 }
        );
      }
      const current = await prisma.user.findUnique({
        where: { id },
        select: { bonusPoints: true },
      });
      if (!current) {
        return NextResponse.json({ error: "Користувача не знайдено" }, { status: 404 });
      }
      const newPoints = Math.max(0, current.bonusPoints + delta);
      const updated = await prisma.user.update({
        where: { id },
        data: { bonusPoints: newPoints },
        select: { id: true, bonusPoints: true },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json(
      { error: "Вкажіть bonusPoints або addBonusPoints" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating user bonus:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
