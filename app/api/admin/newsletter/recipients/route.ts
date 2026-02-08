import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/newsletter/recipients
 * Список email-адрес користувачів з бази (для розсилки).
 */
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { email: { not: null } },
      select: { id: true, email: true, name: true },
      orderBy: { createdAt: "desc" },
    });

    const recipients = users
      .filter((u) => u.email && u.email.trim().length > 0)
      .map((u) => ({
        id: u.id,
        email: u.email!,
        name: u.name,
      }));

    return NextResponse.json({
      recipients,
      total: recipients.length,
    });
  } catch (error) {
    console.error("[newsletter/recipients]", error);
    return NextResponse.json(
      { error: "Не вдалося завантажити список" },
      { status: 500 }
    );
  }
}
