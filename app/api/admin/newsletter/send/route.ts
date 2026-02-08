import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

/**
 * POST /api/admin/newsletter/send
 * Body: { to: "all" | string[], subject: string, body: string, isHtml?: boolean }
 * Надсилає листи користувачам (всі з бази або вказані email).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, body: content, isHtml } = body;

    if (!subject || typeof subject !== "string" || !content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Вкажіть тему та текст листа" },
        { status: 400 }
      );
    }

    let emails: string[] = [];

    if (to === "all") {
      const users = await prisma.user.findMany({
        where: { email: { not: null } },
        select: { email: true },
      });
      emails = users
        .map((u) => u.email)
        .filter((e): e is string => !!e && e.trim().length > 0);
    } else if (Array.isArray(to) && to.length > 0) {
      emails = to
        .filter((e) => typeof e === "string" && e.includes("@"))
        .map((e) => String(e).trim());
    }

    if (emails.length === 0) {
      return NextResponse.json(
        { error: "Немає отримувачів. Додайте користувачів з email або вкажіть адреси." },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to: emails,
      subject,
      text: isHtml ? undefined : content,
      html: isHtml ? content : undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Помилка відправки" },
        { status: 500 }
      );
    }

    try {
      await prisma.newsletterCampaign.create({
        data: {
          subject,
          body: content,
          isHtml: !!isHtml,
          sentCount: emails.length,
        },
      });
    } catch (saveErr) {
      console.error("[newsletter/send] Save campaign failed:", saveErr);
    }

    return NextResponse.json({
      success: true,
      sent: emails.length,
      message: `Лист надіслано ${emails.length} отримувачам`,
    });
  } catch (error) {
    console.error("[newsletter/send]", error);
    return NextResponse.json(
      { error: "Помилка сервера" },
      { status: 500 }
    );
  }
}
