import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, generateWebhookResponseSignature } from "@/lib/wayforpay";
import { prisma } from "@/lib/prisma";
import { sendOrderNotification } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[WayForPay Webhook] Received:", JSON.stringify(body, null, 2));

    const {
      merchantAccount,
      orderReference,
      merchantSignature,
      amount,
      currency,
      authCode,
      cardPan,
      transactionStatus,
      reasonCode,
    } = body;

    const merchantSecret = process.env.MERCHANT_SECRET || process.env.WAYFORPAY_MERCHANT_SECRET;

    if (!merchantSecret) {
      console.error("[WayForPay Webhook] Missing merchant secret");
      return NextResponse.json(
        { error: "Configuration error" },
        { status: 500 }
      );
    }

    // Verify signature
    const isValid = verifyWebhookSignature({
      merchantAccount,
      orderReference,
      amount: parseFloat(amount),
      currency,
      authCode,
      cardPan,
      transactionStatus,
      reasonCode: parseInt(reasonCode),
      secretKey: merchantSecret,
      receivedSignature: merchantSignature,
    });

    if (!isValid) {
      console.error("[WayForPay Webhook] Invalid signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Update order status in database
    if (transactionStatus === "Approved") {
      try {
        // Find order by invoiceId (which is orderReference) with items
        const order = await prisma.order.findFirst({
          where: {
            invoiceId: orderReference,
          },
          include: {
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
            `[WayForPay Webhook] Order ${orderReference} marked as paid`
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
                  product_name: item.product.name,
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
              "[WayForPay Webhook] Failed to send Telegram notification:",
              telegramError
            );
            // Don't fail the webhook if Telegram fails
          }
        } else {
          console.warn(
            `[WayForPay Webhook] Order ${orderReference} not found in database`
          );
        }
      } catch (dbError) {
        console.error("[WayForPay Webhook] Database error:", dbError);
        // Don't fail the webhook, just log the error
      }
    }

    // Generate response signature
    const responseTime = Math.floor(Date.now() / 1000);
    const responseStatus = transactionStatus === "Approved" ? "accept" : "decline";

    // Response signature: orderReference;status;time
    const responseSignature = generateWebhookResponseSignature({
      orderReference,
      status: responseStatus,
      time: responseTime,
      secretKey: merchantSecret,
    });

    const response = {
      orderReference,
      status: responseStatus,
      time: responseTime,
      signature: responseSignature,
    };

    console.log("[WayForPay Webhook] Sending response:", response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("[WayForPay Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

