import { NextRequest, NextResponse } from "next/server";
import { sqlGetAllOrders, sqlPostOrder } from "@/lib/sql";
import { creditBonusesForPaidOrder, getBonusPercentForPurchase, type OrderForBonusCredit } from "@/lib/loyalty";
import crypto from "crypto";

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
    console.error("[GET /orders]", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// ==========================
// POST /api/orders
// ==========================
export async function POST(req: NextRequest) {
  try {
    console.log("=".repeat(50));
    console.log("[POST /api/orders] Starting order creation...");
    
    const body = await req.json();
    console.log("[POST /api/orders] Received body:", JSON.stringify(body, null, 2));

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
      bonus_points_to_spend: bonusPointsToSpendRaw,
      items,
    } = body;

    const bonusPointsToSpend = Math.max(0, Math.floor(Number(bonusPointsToSpendRaw) || 0));

    console.log("[POST /api/orders] Extracted data:", {
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
      console.error("[POST /api/orders] Validation failed:", {
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
    console.log("[POST /api/orders] Validation passed");

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

    // Check stock availability before creating order
    const { prisma } = await import("@/lib/prisma");
    const stockChecks = await Promise.all(
      normalizedItems.map(async (item) => {
        const productSize = await prisma.productSize.findFirst({
          where: {
            productId: item.product_id,
            size: item.size,
          },
        });

        const availableStock = productSize?.stock ?? 0;
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
          `${item.product_name} (розмір ${item.size}): доступно ${item.available} шт., запитано ${item.requested} шт.`
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

    const fullAmount = normalizedItems.reduce(
      (total: number, item) => total + item.price * item.quantity,
      0
    );

    // Знижка по програмі лояльності (3% перша покупка, далі 5–15% за порогами) — тільки для авторизованих
    let loyaltyDiscountAmount = 0;
    if (user_id) {
      const paidOrders = await prisma.order.findMany({
        where: { userId: user_id, paymentStatus: "paid" },
        select: {
          id: true,
          items: { select: { price: true, quantity: true } },
        },
      });
      const totalSpent = paidOrders.reduce((sum, order) => {
        const itemsTotal = order.items.reduce(
          (s: number, it: { price: unknown; quantity: number }) => s + Number(it.price) * it.quantity,
          0
        );
        return sum + itemsTotal;
      }, 0);
      const paidOrdersCount = paidOrders.length;
      const bonusPercent = getBonusPercentForPurchase(totalSpent, paidOrdersCount);
      loyaltyDiscountAmount = Math.round((fullAmount * bonusPercent) / 100 * 100) / 100;
    }

    const orderTotal = fullAmount - loyaltyDiscountAmount;

    // Calculate amount to pay based on payment type
    let amountToPay = orderTotal;
    if (payment_type === "prepay") {
      amountToPay = 200; // передоплата 200 грн
    } else if (payment_type === "test_payment") {
      amountToPay = orderTotal;
    } else if (payment_type === "installment") {
      amountToPay = orderTotal;
    } else if (payment_type === "crypto") {
      amountToPay = orderTotal;
    }

    // Apply bonus points discount (only for logged-in users)
    let effectiveBonusDeduction = 0;
    if (bonusPointsToSpend > 0 && user_id) {
      const user = await prisma.user.findUnique({
        where: { id: user_id },
        select: { bonusPoints: true },
      });
      if (user) {
        const maxBonus = Math.min(
          bonusPointsToSpend,
          user.bonusPoints,
          Math.floor(amountToPay)
        );
        effectiveBonusDeduction = maxBonus;
        amountToPay = Math.max(0, amountToPay - maxBonus);
      }
    }

    console.log("[POST /api/orders] Amount calculation:", {
      fullAmount,
      orderTotal,
      loyaltyDiscountAmount,
      amountToPay,
      payment_type,
      bonusPointsToSpend,
      effectiveBonusDeduction,
    });

    // ✅ Зберігання замовлення у БД
    console.log("[POST /api/orders] Saving order to database...");
    const orderId = crypto.randomUUID();
    const isFullyPaidByBonuses = amountToPay <= 0;
    const isTestPayment = payment_type === "test_payment";

    const postResult = await sqlPostOrder({
      user_id: user_id || null,
      customer_name,
      phone_number,
      email,
      delivery_method,
      city,
      post_office,
      comment,
      payment_type,
      invoice_id: orderId,
      payment_status: isTestPayment || isFullyPaidByBonuses ? "paid" : "pending",
      bonus_points_spent: effectiveBonusDeduction,
      loyalty_discount_amount: loyaltyDiscountAmount,
      items: normalizedItems.map(
        ({ product_id, size, quantity, price, color }) => ({
          product_id,
          size,
          quantity,
          price,
          color,
        })
      ),
    });
    const createdOrderDbId = postResult.orderId;
    console.log("[POST /api/orders] Order saved to database successfully");

    // Deduct bonus points from user if any were used
    if (effectiveBonusDeduction > 0 && user_id) {
      await prisma.user.update({
        where: { id: user_id },
        data: {
          bonusPoints: { decrement: effectiveBonusDeduction },
        },
      });
      console.log("[POST /api/orders] Deducted", effectiveBonusDeduction, "bonus points from user");
    }

    // Тест оплата — імітація повної оплати: замовлення зберігається як оплачене, нараховуються бонуси, редірект на успіх
    if (isTestPayment) {
      if (user_id) {
        const orderForCredit = await prisma.order.findUnique({
          where: { id: createdOrderDbId },
          include: {
            user: { select: { birthDate: true } },
            items: true,
          },
        });
        if (orderForCredit) {
          const { credited } = await creditBonusesForPaidOrder(prisma, orderForCredit as unknown as OrderForBonusCredit);
          if (credited > 0) console.log("[POST /api/orders] Test payment: credited", credited, "bonus points");
        }
      }
      const PUBLIC_URL_FULL = process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";
      return NextResponse.json({
        success: true,
        orderId,
        invoiceUrl: `${PUBLIC_URL_FULL}/success?orderReference=${orderId}`,
      });
    }

    // When fully paid by bonuses - credit bonuses (e.g. birthday) and redirect to success
    if (isFullyPaidByBonuses) {
      if (user_id) {
        const orderForCredit = await prisma.order.findUnique({
          where: { id: createdOrderDbId },
          include: {
            user: { select: { birthDate: true } },
            items: true,
          },
        });
        if (orderForCredit) {
          const { credited } = await creditBonusesForPaidOrder(prisma, orderForCredit as unknown as OrderForBonusCredit);
          if (credited > 0) console.log("[POST /api/orders] Credited", credited, "bonus points (e.g. birthday)");
        }
      }
      const PUBLIC_URL_FULL = process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";
      return NextResponse.json({
        success: true,
        orderId,
        invoiceUrl: `${PUBLIC_URL_FULL}/success?orderReference=${orderId}`,
      });
    }

    // ✅ Створення платежу через WayForPay (якщо не крипта і не тест оплата)
    if (payment_type !== "crypto" && payment_type !== "test_payment") {
      try {
        const productNames = normalizedItems.map(
          (item) =>
            item.color
              ? `${item.product_name} (${item.color}, ${item.size})`
              : `${item.product_name} (${item.size})`
        );
        const productCounts = normalizedItems.map((item) => item.quantity);
        const productPrices = normalizedItems.map((item) => item.price);

        const PUBLIC_URL_FULL = process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";

        const merchantAccount = process.env.MERCHANT_ACCOUNT || process.env.WAYFORPAY_MERCHANT_ACCOUNT;
        const merchantSecret = process.env.MERCHANT_SECRET || process.env.WAYFORPAY_MERCHANT_SECRET;
        // Use localhost for local development, production domain otherwise
        const merchantDomainName = PUBLIC_URL_FULL.includes("localhost") 
          ? "localhost" 
          : (process.env.MERCHANT_DOMAIN || process.env.WAYFORPAY_MERCHANT_DOMAIN || "13vplus.com");

        if (!merchantAccount || !merchantSecret) {
          console.error("[POST /api/orders] Missing WayForPay credentials");
          throw new Error("Payment gateway configuration error");
        }

        const orderDate = Math.floor(Date.now() / 1000);

        // For installment, use PURCHASE method with payment form
        if (payment_type === "installment") {
          // Import WayForPay utilities
          const { generatePaymentSignature } = await import("@/lib/wayforpay");

          // Generate signature for PURCHASE payment
          const merchantSignature = generatePaymentSignature({
            merchantAccount,
            merchantDomainName,
            orderReference: orderId,
            orderDate,
            amount: amountToPay,
            currency: "UAH",
            productName: productNames,
            productCount: productCounts,
            productPrice: productPrices,
            secretKey: merchantSecret,
          });

          // Prepare payment form data for PURCHASE with installment
          // WayForPay expects productName, productPrice, productCount as arrays
          const paymentFormData: Record<string, string | number | string[] | number[]> = {
            merchantAccount,
            merchantAuthType: "SimpleSignature",
            merchantDomainName,
            merchantTransactionType: "AUTH", // CRITICAL: AUTH type enables installment options
            merchantTransactionSecureType: "AUTO",
            merchantSignature,
            apiVersion: 1,
            language: "UA",
            orderReference: orderId,
            orderDate,
            amount: amountToPay.toFixed(2),
            currency: "UAH",
            orderTimeout: 86400, // 24 hours
            // Specify all installment payment systems with available parts
            // Format: systemName:parts (e.g., payParts:2,3,4,5,6)
            paymentSystems: "payParts:2,3,4,5,6;payPartsMono:2,3,4,5,6;payPartsPrivat:2,3,4,5,6;payPartsAbank:2,3,4,5,6;instantAbank;OnusInstallment;payPartsOtp:2,3,4,5,6;globusPlus:2,3,4,5,6",
            productName: productNames,
            productPrice: productPrices.map(p => p.toFixed(2)),
            productCount: productCounts,
          };

          // Add customer info
          if (customer_name) {
            const nameParts = customer_name.trim().split(/\s+/);
            if (nameParts.length >= 2) {
              paymentFormData.clientFirstName = nameParts[0];
              paymentFormData.clientLastName = nameParts.slice(1).join(" ");
            } else {
              paymentFormData.clientFirstName = customer_name;
            }
          }

          if (email) {
            paymentFormData.clientEmail = email;
          }

          if (phone_number) {
            paymentFormData.clientPhone = phone_number;
          }

          paymentFormData.serviceUrl = `${PUBLIC_URL_FULL}/api/wayforpay/webhook`;
          paymentFormData.returnUrl = `${PUBLIC_URL_FULL}/order-success?orderId=${orderId}`;

          console.log("[POST /api/orders] Creating WayForPay payment form for installment...");
          console.log("[POST /api/orders] Payment form data:", JSON.stringify(paymentFormData, null, 2));

          // Call WayForPay API to get payment URL (using behavior=offline for mobile)
          try {
            const wayforpayResponse = await fetch("https://secure.wayforpay.com/pay?behavior=offline", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams(
                Object.entries(paymentFormData).flatMap(([key, value]) => {
                  if (Array.isArray(value)) {
                    return value.map((v, i) => [`${key}[${i}]`, String(v)]);
                  }
                  return [[key, String(value)]];
                })
              ),
            });

            const wayforpayResult = await wayforpayResponse.json();
            console.log("[POST /api/orders] WayForPay response:", JSON.stringify(wayforpayResult, null, 2));

            if (wayforpayResult.url) {
              console.log("[POST /api/orders] WayForPay payment URL created successfully");
              console.log("[POST /api/orders] Payment URL:", wayforpayResult.url);
              console.log("[POST /api/orders] Successfully completed order creation");
              console.log("=".repeat(50));

              // Return payment URL for redirect
              return NextResponse.json({
                success: true,
                orderId: orderId,
                paymentUrl: wayforpayResult.url,
                paymentType: payment_type,
                formData: paymentFormData, // Also return form data as fallback
              });
            } else {
              console.error("[POST /api/orders] WayForPay payment URL creation failed:", wayforpayResult);
              // Fallback: return form data for client-side form submission
              return NextResponse.json({
                success: true,
                orderId: orderId,
                paymentType: payment_type,
                formData: paymentFormData,
                formAction: "https://secure.wayforpay.com/pay",
              });
            }
          } catch (wayforpayError) {
            console.error("[POST /api/orders] Error calling WayForPay API:", wayforpayError);
            // Fallback: return form data for client-side form submission
            return NextResponse.json({
              success: true,
              orderId: orderId,
              paymentType: payment_type,
              formData: paymentFormData,
              formAction: "https://secure.wayforpay.com/pay",
            });
          }
        }

        // For full payment and prepay, use the working method
        console.log(`[POST /api/orders] Creating payment for type: ${payment_type}`);
        // Import WayForPay utilities
        const { generatePurchaseSignature } = await import("@/lib/wayforpay");

        // Generate signature
        const merchantSignature = generatePurchaseSignature({
          merchantAccount,
          merchantDomainName,
          orderReference: orderId,
          orderDate,
          amount: amountToPay,
          currency: "UAH",
          productNames,
          productCounts,
          productPrices,
          secretKey: merchantSecret,
        });

        // Prepare payment data
        const paymentData: Record<string, string | number | string[] | number[]> = {
          merchantAccount,
          merchantAuthType: "SimpleSignature",
          merchantDomainName,
          merchantTransactionType: "AUTO",
          merchantTransactionSecureType: "AUTO",
          merchantSignature,
          apiVersion: 1,
          language: "UA",
          orderReference: orderId,
          orderDate,
          amount: amountToPay.toFixed(2),
          currency: "UAH",
          productName: productNames,
          productCount: productCounts,
          productPrice: productPrices.map((p: number) => p.toFixed(2)),
        };

        // Add customer info
        if (customer_name) {
          const nameParts = customer_name.trim().split(/\s+/);
          if (nameParts.length >= 2) {
            paymentData.clientFirstName = nameParts[0];
            paymentData.clientLastName = nameParts.slice(1).join(" ");
          } else {
            paymentData.clientFirstName = customer_name;
          }
        }

        if (email) {
          paymentData.clientEmail = email;
        }

        if (phone_number) {
          paymentData.clientPhone = phone_number;
        }

        paymentData.returnUrl = `${PUBLIC_URL_FULL}/success?orderReference=${orderId}`;
        paymentData.serviceUrl = `${PUBLIC_URL_FULL}/api/wayforpay/webhook`;

        console.log(
          "[POST /api/orders] WayForPay payment data created successfully"
        );
        console.log("[POST /api/orders] Payment data:", JSON.stringify(paymentData, null, 2));

        console.log("[POST /api/orders] Returning response with payment data");
        console.log("[POST /api/orders] Successfully completed order creation");
        console.log("=".repeat(50));

        return NextResponse.json({
          success: true,
          orderId: orderId,
          paymentUrl: "https://secure.wayforpay.com/pay",
          paymentData: paymentData,
        });
      } catch (paymentError) {
        console.error(
          "[POST /api/orders] Payment creation error:",
          paymentError
        );
        // Return error if payment creation failed
        return NextResponse.json(
          {
            error: "Не вдалося створити платіж. Перевірте налаштування WayForPay.",
            orderId: orderId,
            details: paymentError instanceof Error ? paymentError.message : "Unknown error",
          },
          { status: 500 }
        );
      }
    }

    // ✅ Створення платежу через Plisio для криптоплатежів
    if (payment_type === "crypto") {
      try {
        const PUBLIC_URL = process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";

        // Create Plisio invoice
        const plisioResponse = await fetch(
          `${PUBLIC_URL}/api/plisio/create-invoice`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderNumber: orderId,
              orderName: `Order ${orderId}`,
              amount: amountToPay.toFixed(2),
              email: email || undefined,
              callbackUrl: `${PUBLIC_URL}/api/plisio/webhook`,
              successCallbackUrl: `${PUBLIC_URL}/success?orderReference=${orderId}`,
              failCallbackUrl: `${PUBLIC_URL}/final?orderReference=${orderId}&status=failed`,
            }),
          }
        );

        if (!plisioResponse.ok) {
          console.error(
            "[POST /api/orders] Failed to create Plisio invoice"
          );
          throw new Error("Failed to create crypto payment");
        }

        const plisioData = await plisioResponse.json();
        console.log(
          "[POST /api/orders] Plisio invoice created successfully"
        );

        console.log("[POST /api/orders] Returning response with Plisio invoice");
        console.log("[POST /api/orders] Successfully completed order creation");
        console.log("=".repeat(50));

        return NextResponse.json({
          success: true,
          orderId: orderId,
          paymentUrl: plisioData.invoiceUrl,
          txnId: plisioData.txnId,
          paymentType: "crypto",
        });
      } catch (paymentError) {
        console.error(
          "[POST /api/orders] Plisio payment creation error:",
          paymentError
        );
        // Return error if payment creation failed
        return NextResponse.json(
          {
            error: "Не вдалося створити платіж. Перевірте налаштування Plisio.",
            orderId: orderId,
            details: paymentError instanceof Error ? paymentError.message : "Unknown error",
          },
          { status: 500 }
        );
      }
    }

    // For non-crypto, non-payment orders (shouldn't happen, but just in case)
    console.log("[POST /api/orders] Returning response with orderId:", orderId);
    console.log("[POST /api/orders] Successfully completed order creation");
    console.log("=".repeat(50));

    return NextResponse.json({
      success: true,
      orderId: orderId,
      message: "Замовлення успішно створено",
    });
  } catch (error) {
    console.error("[POST /api/orders] ERROR occurred:", error);
    console.error("[POST /api/orders] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    console.log("=".repeat(50));
    
    return NextResponse.json(
      { error: "Failed to create order", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
