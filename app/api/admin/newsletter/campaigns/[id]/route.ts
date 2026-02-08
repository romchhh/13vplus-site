import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/newsletter/campaigns/[id]
 * Отримати одну збережену розсилку (перегляд).
 */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const campaign = await prisma.newsletterCampaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Розсилку не знайдено" }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2021") {
      return NextResponse.json({ error: "Розсилку не знайдено" }, { status: 404 });
    }
    console.error("[newsletter/campaigns/[id]]", error);
    return NextResponse.json(
      { error: "Помилка сервера" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/newsletter/campaigns/[id]/resend
 * Розіслати збережену розсилку знову (усім з бази).
 */
export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const campaign = await prisma.newsletterCampaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Розсилку не знайдено" }, { status: 404 });
    }

    const users = await prisma.user.findMany({
      where: { email: { not: null } },
      select: { email: true },
    });
    const emails = users
      .map((u) => u.email)
      .filter((e): e is string => !!e && e.trim().length > 0);

    if (emails.length === 0) {
      return NextResponse.json(
        { error: "Немає отримувачів з email у базі" },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to: emails,
      subject: campaign.subject,
      text: campaign.isHtml ? undefined : campaign.body,
      html: campaign.isHtml ? campaign.body : undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Помилка відправки" },
        { status: 500 }
      );
    }

    await prisma.newsletterCampaign.update({
      where: { id },
      data: { sentCount: { increment: emails.length } },
    });

    return NextResponse.json({
      success: true,
      sent: emails.length,
      message: `Розсилку надіслано знову ${emails.length} отримувачам`,
    });
  } catch (error) {
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2021") {
      return NextResponse.json(
        { error: "Таблицю розсилок не створено. Застосуйте міграцію: npx prisma migrate deploy" },
        { status: 503 }
      );
    }
    console.error("[newsletter/campaigns/[id]/resend]", error);
    return NextResponse.json(
      { error: "Помилка сервера" },
      { status: 500 }
    );
  }
}
