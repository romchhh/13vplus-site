import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/promo/validate
 * Body: { code: string, subtotal: number, deliveryCost?: number }
 * Returns: { valid: boolean, promoCodeId?: number, discountAmount?: number, type?: string, value?: number, message?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    const subtotal = Number(body.subtotal) || 0;
    const deliveryCost = Number(body.deliveryCost) || 0;
    const orderTotal = subtotal + deliveryCost;

    if (!code) {
      return NextResponse.json({
        valid: false,
        message: "Введіть промокод",
      });
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code },
    });

    if (!promo) {
      return NextResponse.json({
        valid: false,
        message: "Промокод не знайдено",
      });
    }

    const now = new Date();
    if (promo.validFrom && now < promo.validFrom) {
      return NextResponse.json({
        valid: false,
        message: "Промокод ще не діє",
      });
    }
    if (promo.validUntil && now > promo.validUntil) {
      return NextResponse.json({
        valid: false,
        message: "Термін дії промокоду закінчився",
      });
    }
    if (promo.maxUses != null && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({
        valid: false,
        message: "Промокод вичерпано",
      });
    }

    const value = Number(promo.value);
    let discountAmount = 0;

    if (promo.type === "percent") {
      discountAmount = Math.round((orderTotal * value) / 100);
    } else {
      discountAmount = Math.min(value, orderTotal);
    }

    if (discountAmount <= 0) {
      return NextResponse.json({
        valid: false,
        message: "Знижка не застосовується до цього замовлення",
      });
    }

    return NextResponse.json({
      valid: true,
      promoCodeId: promo.id,
      discountAmount,
      type: promo.type,
      value,
      message:
        promo.type === "percent"
          ? `Знижка ${value}%`
          : `Знижка ${value} грн`,
    });
  } catch (e) {
    console.error("[promo/validate]", e);
    return NextResponse.json(
      { valid: false, message: "Помилка перевірки промокоду" },
      { status: 500 }
    );
  }
}
