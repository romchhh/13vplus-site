import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { not: null } },
          { phone: { not: null } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        bonusPoints: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
