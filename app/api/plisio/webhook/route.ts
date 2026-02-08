import { NextRequest, NextResponse } from "next/server";
import { verifyPlisioCallback } from "@/lib/plisio";
import { prisma } from "@/lib/prisma";
import { sendOrderNotification } from "@/lib/telegram";
import { creditBonusesForPaidOrder, type OrderForBonusCredit } from "@/lib/loyalty";

export async function POST(req: NextRequest) {
  try {
    // Plisio sends data as JSON if json=true is in callback URL
    const contentType = req.headers.get("content-type");
    let body: Record<string, string | number | undefined>;

    if (contentType?.includes("application/json")) {
      body = await req.json();
    } else {
      // Form data - convert to string values
      const formData = await req.formData();
      const formEntries: Record<string, string | number | undefined> = {};
      formData.forEach((value, key) => {
        formEntries[key] = value instanceof File ? undefined : String(value);
      });
      body = formEntries;
    }

    console.log("[Plisio Webhook] Received:", JSON.stringify(body, null, 2));

    const secretKey = process.env.PLISIO_API_KEY;

    if (!secretKey) {
      console.error("[Plisio Webhook] Missing API key");
      return NextResponse.json(
        { error: "Configuration error" },
        { status: 500 }
      );
    }

    // Verify callback signature
    const isValid = verifyPlisioCallback(body, secretKey);

    if (!isValid) {
      console.error("[Plisio Webhook] Invalid signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const {
      txn_id,
      order_number,
      status,
      amount,
      currency,
    } = body;

    console.log("[Plisio Webhook] Processing:", {
      txn_id,
      order_number,
      status,
      amount,
      currency,
    });

    // Update order status in database
    if (status === "completed") {
      try {
        // Find order by invoiceId (which is order_number) with items
        // Convert order_number to string if it's a number
        const orderNumberStr = String(order_number);
        const order = await prisma.order.findFirst({
          where: {
            invoiceId: orderNumberStr,
          },
          include: {
            user: { select: { birthDate: true } },
            items: {
              include: {
                product: {
                  select: { name: true },
                },
              },
            },
          },
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: "paid",
              status: "pending", // Order is paid, now waiting for processing
            },
          });

          console.log(
            `[Plisio Webhook] Order ${order_number} marked as paid`
          );

          // Send Telegram notification
          try {
            await sendOrderNotification(
              {
                id: order.id,
                invoice_id: order.invoiceId,
                customer_name: order.customerName,
                phone_number: order.phoneNumber,
                email: order.email,
                delivery_method: order.deliveryMethod,
                city: order.city,
                post_office: order.postOffice,
                comment: order.comment,
                payment_type: order.paymentType,
                payment_status: "paid",
                status: order.status,
                items: order.items.map((item) => ({
                  product_name: item.product?.name ?? "Товар",
                  size: item.size,
                  quantity: item.quantity,
                  price: Number(item.price),
                  color: item.color,
                })),
                created_at: order.createdAt,
              },
              true // isPaid = true
            );
          } catch (telegramError) {
            console.error(
              "[Plisio Webhook] Failed to send Telegram notification:",
              telegramError
            );
            // Don't fail the webhook if Telegram fails
          }
          try {
            const { credited } = await creditBonusesForPaidOrder(prisma, order as unknown as OrderForBonusCredit);
            if (credited > 0) console.log(`[Plisio Webhook] ✓ Credited ${credited} bonus points`);
          } catch (bonusErr) {
            console.error("[Plisio Webhook] Bonus credit error:", bonusErr);
          }
        } else {
          console.warn(
            `[Plisio Webhook] Order ${order_number} not found in database`
          );
        }
      } catch (dbError) {
        console.error("[Plisio Webhook] Database error:", dbError);
        // Don't fail the webhook, just log the error
      }
    }

    // Return success response
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[Plisio Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

