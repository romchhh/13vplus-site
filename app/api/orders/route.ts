import { NextRequest, NextResponse } from "next/server";
import { sqlGetAllOrders, sqlPostOrder } from "@/lib/sql";
import { getOrCreateOrderCustomer } from "@/lib/orderCustomer";
import { sendOrderConfirmationEmail } from "@/lib/orderConfirmationEmail";
import { createLogger } from "@/lib/logger";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const log = createLogger("POST /api/orders");

type IncomingOrderItem = {
  product_id?: number | string;
  productId?: number | string;
  price: number | string;
  quantity: number | string;
  product_name?: string;
  name?: string;
  size: string | number;
  color?: string | null;
};

type NormalizedOrderItem = {
  product_id: number;
  product_name: string;
  size: string;
  quantity: number;
  price: number;
  color: string | null;
};

// ==========================
// GET /api/orders
// ==========================
export async function GET() {
  try {
    const orders = await sqlGetAllOrders();
    return NextResponse.json(orders);
  } catch (error) {
    log.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: "Failed to fetch orders",
        ...(process.env.NODE_ENV === "development" && { details: message }),
      },
      { status: 500 }
    );
  }
}

// ==========================
// POST /api/orders
// ==========================
export async function POST(req: NextRequest) {
  try {
    log.debug("Starting order creation");
    const body = await req.json();
    log.debug("Received body:", JSON.stringify(body, null, 2));

    const {
      user_id,
      customer_name,
      phone_number,
      email,
      delivery_method,
      city,
      post_office,
      comment,
      payment_type, // "full" або "prepay"
      items,
      promo_code: promoCodeFromBody,
      delivery_cost: deliveryCostFromBody,
    } = body;

    log.debug("Extracted data:", {
      customer_name,
      phone_number,
      email,
      delivery_method,
      city,
      post_office,
      payment_type,
      itemsCount: items?.length,
    });

    // ✅ Basic validation
    if (
      !customer_name ||
      !phone_number ||
      !delivery_method ||
      !city ||
      !post_office ||
      !items?.length
    ) {
      log.warn("Validation failed:", {
        hasCustomerName: !!customer_name,
        hasPhoneNumber: !!phone_number,
        hasDeliveryMethod: !!delivery_method,
        hasCity: !!city,
        hasPostOffice: !!post_office,
        hasItems: !!items?.length,
      });
      return NextResponse.json(
        { error: "Missing required order fields" },
        { status: 400 }
      );
    }
    log.debug("Validation passed");

    const normalizedItems: NormalizedOrderItem[] = (items || []).map(
      (item: IncomingOrderItem, index: number) => {
        const productIdRaw = item.product_id ?? item.productId;
        const productId = Number(productIdRaw);
        if (!Number.isFinite(productId)) {
          throw new Error(
            `[POST /api/orders] Invalid product_id for item index ${index}`
          );
        }

        const price =
          typeof item.price === "string" ? Number(item.price) : item.price;
        if (!Number.isFinite(price)) {
          throw new Error(
            `[POST /api/orders] Invalid price for item index ${index}`
          );
        }

        const quantity =
          typeof item.quantity === "string"
            ? Number(item.quantity)
            : item.quantity;
        if (!Number.isFinite(quantity)) {
          throw new Error(
            `[POST /api/orders] Invalid quantity for item index ${index}`
          );
        }

        return {
          product_id: productId,
          product_name:
            item.product_name ||
            item.name ||
            `Товар #${productId}`,
          size: String(item.size),
          quantity,
          price,
          color: item.color ?? null,
        };
      }
    );

    // Check stock availability before creating order (product.stock)
    const { prisma } = await import("@/lib/prisma");
    const stockChecks = await Promise.all(
      normalizedItems.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.product_id },
          select: { stock: true },
        });
        const availableStock = product?.stock ?? 0;
        return {
          product_id: item.product_id,
          product_name: item.product_name,
          size: item.size,
          requested: item.quantity,
          available: availableStock,
          sufficient: availableStock >= item.quantity,
        };
      })
    );

    const insufficientItems = stockChecks.filter((check) => !check.sufficient);
    if (insufficientItems.length > 0) {
      const errorMessages = insufficientItems.map(
        (item) =>
          `${item.product_name}: доступно ${item.available} шт., запитано ${item.requested} шт.`
      );
      return NextResponse.json(
        {
          error: "Недостатньо товару в наявності",
          details: errorMessages,
          insufficientItems,
        },
        { status: 400 }
      );
    }

    const subtotal = normalizedItems.reduce(
      (total: number, item) => total + item.price * item.quantity,
      0
    );
    const deliveryCost = Number(deliveryCostFromBody) || 0;
    const fullAmount = subtotal + deliveryCost;

    let promoCodeId: number | null = null;
    let promoDiscountAmount = 0;
    const promoCode = typeof promoCodeFromBody === "string" ? promoCodeFromBody.trim().toUpperCase() : "";
    if (promoCode) {
      const { prisma } = await import("@/lib/prisma");
      const promo = await prisma.promoCode.findUnique({ where: { code: promoCode } });
      if (promo) {
        const now = new Date();
        const validByDate = (!promo.validFrom || now >= promo.validFrom) && (!promo.validUntil || now <= promo.validUntil);
        const underLimit = promo.maxUses == null || promo.usedCount < promo.maxUses;
        if (validByDate && underLimit) {
          const value = Number(promo.value);
          if (promo.type === "percent") {
            promoDiscountAmount = Math.round((fullAmount * value) / 100);
          } else {
            promoDiscountAmount = Math.min(value, fullAmount);
          }
          if (promoDiscountAmount > 0) {
            promoCodeId = promo.id;
          }
        }
      }
    }

    const orderTotal = Math.max(0, fullAmount - promoDiscountAmount);

    let amountToPay = orderTotal;
    if (payment_type === "prepay") {
      amountToPay = 200; // передоплата 200 грн
    } else if (payment_type === "test_payment") {
      amountToPay = orderTotal;
    } else if (payment_type === "installment") {
      amountToPay = orderTotal;
    }

    log.debug(" Amount calculation:", {
      fullAmount,
      orderTotal,
      amountToPay,
      payment_type,
    });

    // Зберігаємо клієнта в таблиці users для адмінки та майбутніх розсилок
    let customerUserId: string | null = user_id || null;
    try {
      const createdOrExistingId = await getOrCreateOrderCustomer({
        customer_name,
        email: email || null,
        phone: phone_number,
        city,
        post_office,
      });
      customerUserId = createdOrExistingId;
    } catch (err) {
      log.warn("Failed to get/create order customer, order will have no user_id:", err);
    }

    const orderId = crypto.randomUUID();
    const isTestPayment = payment_type === "test_payment";
    const PUBLIC_URL_FULL = process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";

    const orderPayload = {
      user_id: customerUserId,
      customer_name,
      phone_number,
      email,
      delivery_method,
      city,
      post_office,
      comment,
      payment_type,
      bonus_points_spent: 0,
      loyalty_discount_amount: 0,
      promo_code_id: promoCodeId ?? undefined,
      promo_discount_amount: promoDiscountAmount > 0 ? promoDiscountAmount : undefined,
      items: normalizedItems.map(
        ({ product_id, product_name, size, quantity, price, color }) => ({
          product_id,
          product_name,
          size,
          quantity,
          price,
          color,
        })
      ),
    };

    // Тест оплата — зберігаємо з orderId і редірект на успіх
    if (isTestPayment) {
      log.debug(" Saving order (test_payment)...");
      await sqlPostOrder({
        ...orderPayload,
        invoice_id: orderId,
        payment_status: "paid",
      });
      // Лист підтвердження на email клієнта (як при реальній оплаті)
      if (email && String(email).trim()) {
        try {
          const productIds = [...new Set(normalizedItems.map((i) => i.product_id))];
          const mediaList = productIds.length > 0
            ? await prisma.productMedia.findMany({
                where: { productId: { in: productIds } },
                orderBy: [{ productId: "asc" }, { id: "asc" }],
                select: { productId: true, url: true },
              })
            : [];
          const productImageUrls = new Map<number, string>();
          const seen = new Set<number>();
          for (const m of mediaList) {
            if (seen.has(m.productId)) continue;
            seen.add(m.productId);
            const fullUrl = m.url.startsWith("http") ? m.url : `${PUBLIC_URL_FULL}/api/images/${m.url}`;
            productImageUrls.set(m.productId, fullUrl);
          }
          await sendOrderConfirmationEmail(
            {
              customer_name,
              email: String(email).trim(),
              phone_number: phone_number,
              delivery_method,
              city,
              post_office,
              payment_type,
              comment: comment ?? null,
              invoice_id: orderId,
              created_at: new Date(),
              items: normalizedItems.map((item) => ({
                product_id: item.product_id,
                product_name: item.product_name,
                size: item.size,
                quantity: item.quantity,
                price: item.price,
                color: item.color,
              })),
            },
            productImageUrls
          );
        } catch (e) {
          log.warn("Order confirmation email (test_payment) failed:", e);
        }
      }
      return NextResponse.json({
        success: true,
        orderId,
        invoiceUrl: `${PUBLIC_URL_FULL}/success?orderReference=${orderId}`,
      });
    }

    // Оплата через Monobank (Mono)
    const monoToken = process.env.NEXT_PUBLIC_MONO_TOKEN;
    if (!monoToken) {
      log.error(" Missing NEXT_PUBLIC_MONO_TOKEN");
      return NextResponse.json(
        { error: "Не налаштовано оплату. Зв'яжіться з підтримкою." },
        { status: 500 }
      );
    }

    const amountInMinorUnits = Math.round(amountToPay * 100);
    const basketOrder = normalizedItems.map((item) => ({
      name: item.color ? `${item.product_name} (${item.color})` : item.product_name,
      qty: item.quantity,
      sum: Math.round(item.price * item.quantity * 100),
      total: Math.round(item.price * item.quantity * 100),
      unit: "шт.",
      code: item.color ? `${item.product_id}-${item.size}-${item.color}` : `${item.product_id}-${item.size}`,
    }));

    const invoicePayload = {
      amount: amountInMinorUnits,
      ccy: 980,
      merchantPaymInfo: {
        reference: orderId,
        destination: "Оплата замовлення",
        comment: comment || "Оплата замовлення",
        basketOrder,
      },
      redirectUrl: `${PUBLIC_URL_FULL}/success`,
      webHookUrl: `${PUBLIC_URL_FULL}/api/mono-webhook`,
      validity: 3600,
      paymentType: "debit",
    };

    log.debug(" Creating Mono invoice...");
    const monoRes = await fetch("https://api.monobank.ua/api/merchant/invoice/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Token": monoToken,
      },
      body: JSON.stringify(invoicePayload),
    });

    const invoiceData = await monoRes.json();
    if (!monoRes.ok) {
      log.error(" Monobank error:", invoiceData);
      return NextResponse.json(
        {
          error: "Не вдалося створити рахунок для оплати. Спробуйте пізніше або зв'яжіться з нами.",
          details: invoiceData,
        },
        { status: 500 }
      );
    }

    const { invoiceId: monoInvoiceId, pageUrl } = invoiceData;
    if (!monoInvoiceId || !pageUrl) {
      log.error(" Monobank response missing invoiceId or pageUrl:", invoiceData);
      return NextResponse.json(
        { error: "Некоректна відповідь платіжної системи." },
        { status: 500 }
      );
    }

    log.debug(" Saving order with Mono invoice_id...");
    await sqlPostOrder({
      ...orderPayload,
      invoice_id: monoInvoiceId,
      payment_status: "pending",
    });

    return NextResponse.json({
      success: true,
      orderId: monoInvoiceId,
      invoiceUrl: pageUrl,
    });
  } catch (error) {
    log.error(" ERROR occurred:", error);
    log.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: "Failed to create order", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
