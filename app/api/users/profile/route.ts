import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    const user = await prisma.user.findUnique({
      where: userId ? { id: userId } : { email: session.user.email ?? undefined },
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
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, address, clothingSize, birthDate } = body;

    const userId = (session.user as { id?: string }).id;
    const where = userId ? { id: userId } : { email: session.user.email ?? undefined };
    const existing = await prisma.user.findUnique({ where, select: { birthDate: true } });
    const birthDateToSet =
      existing?.birthDate != null ? undefined : birthDate ? new Date(birthDate) : null;
    const user = await prisma.user.update({
      where,
      data: {
        name: name || null,
        email: email || session.user.email,
        phone: phone || null,
        address: address || null,
        clothingSize: clothingSize || null,
        ...(birthDateToSet !== undefined && { birthDate: birthDateToSet }),
      },
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
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
