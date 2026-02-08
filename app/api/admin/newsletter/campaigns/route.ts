import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/newsletter/campaigns
 * Список збережених розсилок (для перегляду та повторної відправки).
 */
export async function GET() {
  try {
    const campaigns = await prisma.newsletterCampaign.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        subject: true,
        body: true,
        isHtml: true,
        sentCount: true,
        createdAt: true,
      },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2021") {
      return NextResponse.json([]);
    }
    console.error("[newsletter/campaigns]", error);
    return NextResponse.json(
      { error: "Не вдалося завантажити розсилки" },
      { status: 500 }
    );
  }
}
