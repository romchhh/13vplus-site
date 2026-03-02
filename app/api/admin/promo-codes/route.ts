import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/promo-codes — список промокодів
 */
export async function GET() {
  try {
    const list = await prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      list.map((p) => ({
        id: p.id,
        code: p.code,
        type: p.type,
        value: Number(p.value),
        validFrom: p.validFrom?.toISOString() ?? null,
        validUntil: p.validUntil?.toISOString() ?? null,
        maxUses: p.maxUses,
        usedCount: p.usedCount,
        createdAt: p.createdAt.toISOString(),
      }))
    );
  } catch (e) {
    console.error("[admin/promo-codes GET]", e);
    return NextResponse.json(
      { error: "Не вдалося завантажити промокоди" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/promo-codes — створити промокод
 * Body: { code, type: "percent" | "fixed", value, validFrom?, validUntil?, maxUses? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    const type = body.type === "fixed" ? "fixed" : "percent";
    const value = Math.max(0, Number(body.value) || 0);

    if (!code) {
      return NextResponse.json(
        { error: "Код промокоду обов'язковий" },
        { status: 400 }
      );
    }

    if (type === "percent" && (value < 1 || value > 100)) {
      return NextResponse.json(
        { error: "Відсоток знижки має бути від 1 до 100" },
        { status: 400 }
      );
    }

    const existing = await prisma.promoCode.findUnique({
      where: { code },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Промокод з таким кодом вже існує" },
        { status: 400 }
      );
    }

    const validFrom = body.validFrom ? new Date(body.validFrom) : null;
    const validUntil = body.validUntil ? new Date(body.validUntil) : null;
    const maxUses = body.maxUses != null ? Math.max(0, Number(body.maxUses)) : null;

    const created = await prisma.promoCode.create({
      data: {
        code,
        type,
        value,
        validFrom,
        validUntil,
        maxUses,
      },
    });

    return NextResponse.json({
      id: created.id,
      code: created.code,
      type: created.type,
      value: Number(created.value),
      validFrom: created.validFrom?.toISOString() ?? null,
      validUntil: created.validUntil?.toISOString() ?? null,
      maxUses: created.maxUses,
      usedCount: created.usedCount,
      createdAt: created.createdAt.toISOString(),
    });
  } catch (e) {
    console.error("[admin/promo-codes POST]", e);
    return NextResponse.json(
      { error: "Не вдалося створити промокод" },
      { status: 500 }
    );
  }
}
