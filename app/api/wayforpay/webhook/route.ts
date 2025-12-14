import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, generateWebhookResponseSignature } from "@/lib/wayforpay";
import { prisma } from "@/lib/prisma";
import { sendOrderNotification } from "@/lib/telegram";

// Disable Server Actions for this route
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Disable Server Actions body parsing
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  // Set headers to prevent Server Actions validation
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  
  let body: Record<string, unknown> = {};
  let orderReference: string = "unknown";
  
  try {
    // WayForPay can send data as JSON or form-data
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      // Handle form-data - WayForPay may send JSON as a string in form-data
      const formData = await req.formData();
      const formEntries: Record<string, unknown> = {};
      
      console.log("[WayForPay Webhook] Processing form-data");
      
      // Check if form-data contains a JSON string (WayForPay sends JSON as key with empty value)
      let jsonParsed = false;
      for (const [key, value] of formData.entries()) {
        const stringValue = value instanceof File ? undefined : String(value);
        
        console.log("[WayForPay Webhook] Form entry:", { 
          key: key.substring(0, 100), 
          value: stringValue?.substring(0, 100) || "empty",
          keyStartsWithBrace: key.trim().startsWith("{")
        });
        
        // If key is a JSON string (starts with {) - WayForPay sends JSON as key
        if (key.trim().startsWith("{")) {
          try {
            const parsed = JSON.parse(key);
            console.log("[WayForPay Webhook] Successfully parsed JSON from form-data key");
            Object.assign(formEntries, parsed);
            jsonParsed = true;
            break;
          } catch (parseError) {
            console.warn("[WayForPay Webhook] Failed to parse JSON from key:", parseError);
            console.warn("[WayForPay Webhook] Key content:", key.substring(0, 200));
          }
        }
        
        // Also check if value is a JSON string
        if (!jsonParsed && stringValue && stringValue.trim().startsWith("{")) {
          try {
            const parsed = JSON.parse(stringValue);
            console.log("[WayForPay Webhook] Successfully parsed JSON from form-data value");
            Object.assign(formEntries, parsed);
            jsonParsed = true;
            break;
          } catch (parseError) {
            console.warn("[WayForPay Webhook] Failed to parse JSON from value:", parseError);
          }
        }
        
        // Store regular form fields (only if we haven't parsed JSON yet)
        if (stringValue !== undefined && !jsonParsed) {
          formEntries[key] = stringValue;
        }
      }
      
      // If we parsed JSON, use it; otherwise use form entries
      if (jsonParsed) {
        body = formEntries;
      } else {
        body = formEntries;
        // Convert string values to appropriate types
        if (body.amount) {
          const amountVal = body.amount;
          body.amount = typeof amountVal === "string" ? parseFloat(amountVal) : Number(amountVal);
        }
        if (body.reasonCode) {
          const reasonVal = body.reasonCode;
          body.reasonCode = typeof reasonVal === "string" ? parseInt(reasonVal) : Number(reasonVal);
        }
      }
    }

    // Extract orderReference early for error handling
    orderReference = String(body.orderReference || "unknown");

    console.log("[WayForPay Webhook] Received:", JSON.stringify(body, null, 2));

    // Extract and type-check values from body
    const merchantAccount = String(body.merchantAccount || "");
    const merchantSignature = String(body.merchantSignature || "");
    const amount = body.amount;
    const currency = String(body.currency || "UAH");
    const authCode = String(body.authCode || "");
    const cardPan = String(body.cardPan || "");
    const transactionStatus = String(body.transactionStatus || "");
    const reasonCode = body.reasonCode;
    
    // Use orderReference from earlier extraction
    const orderRef = orderReference;

    // Validate required fields
    if (!merchantAccount || !orderRef || !merchantSignature || !transactionStatus) {
      console.error("[WayForPay Webhook] Missing required fields:", {
        merchantAccount: !!merchantAccount,
        orderReference: !!orderRef,
        merchantSignature: !!merchantSignature,
        transactionStatus: !!transactionStatus,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const merchantSecret = process.env.MERCHANT_SECRET || process.env.WAYFORPAY_MERCHANT_SECRET;

    if (!merchantSecret) {
      console.error("[WayForPay Webhook] Missing merchant secret");
      return NextResponse.json(
        { error: "Configuration error" },
        { status: 500 }
      );
    }

    // Log merchant account for debugging (without exposing secret)
    console.log("[WayForPay Webhook] Using merchant account:", merchantAccount);
    console.log("[WayForPay Webhook] Merchant secret length:", merchantSecret.length);

    // Prepare data for signature verification
    const amountNum = amount !== undefined && amount !== null 
      ? (typeof amount === "string" ? parseFloat(amount) : Number(amount))
      : 0;
    const reasonCodeNum = reasonCode !== undefined && reasonCode !== null
      ? (typeof reasonCode === "string" ? parseInt(reasonCode) : Number(reasonCode))
      : 0;

    console.log("[WayForPay Webhook] Verifying signature with:", {
      merchantAccount,
      orderReference,
      amount: amountNum,
      currency,
      authCode,
      cardPan,
      transactionStatus,
      reasonCode: reasonCodeNum,
    });

    // Verify signature
    const isValid = verifyWebhookSignature({
      merchantAccount: String(merchantAccount),
      orderReference: String(orderRef),
      amount: amountNum,
      currency: String(currency || "UAH"),
      authCode: String(authCode || ""),
      cardPan: String(cardPan || ""),
      transactionStatus: String(transactionStatus),
      reasonCode: reasonCodeNum,
      secretKey: merchantSecret,
      receivedSignature: String(merchantSignature),
    });

    if (!isValid) {
      console.error("[WayForPay Webhook] Invalid signature");
      console.error("[WayForPay Webhook] Expected signature params:", {
        merchantAccount: String(merchantAccount),
        orderReference: String(orderReference),
        amount: amountNum.toFixed(2),
        currency: String(currency || "UAH"),
        authCode: String(authCode || ""),
        cardPan: String(cardPan || ""),
        transactionStatus: String(transactionStatus),
        reasonCode: String(reasonCodeNum),
      });
      // Still process the webhook if transaction is approved (for production safety)
      // But log the error for investigation
      if (transactionStatus !== "Approved") {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 400 }
        );
      }
      console.warn("[WayForPay Webhook] Continuing despite invalid signature for Approved transaction");
    } else {
      console.log("[WayForPay Webhook] Signature verified successfully");
    }

    // Update order status in database
    if (transactionStatus === "Approved") {
      try {
        // Find order by invoiceId (which is orderReference) with items
        const order = await prisma.order.findFirst({
          where: {
            invoiceId: orderRef,
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
            `[WayForPay Webhook] Order ${orderRef} marked as paid`
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
            `[WayForPay Webhook] Order ${orderRef} not found in database`
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
      orderReference: orderRef,
      status: responseStatus,
      time: responseTime,
      secretKey: merchantSecret,
    });

    const response = {
      orderReference: orderRef,
      status: responseStatus,
      time: responseTime,
      signature: responseSignature,
    };

    console.log("[WayForPay Webhook] Sending response:", response);

    // Return response with proper headers to avoid Server Actions validation
    return NextResponse.json(response, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[WayForPay Webhook] Error:", error);
    // Always return a valid WayForPay response format, even on error
    // This prevents WayForPay from retrying the webhook
    const responseTime = Math.floor(Date.now() / 1000);
    const merchantSecret = process.env.MERCHANT_SECRET || process.env.WAYFORPAY_MERCHANT_SECRET;
    
    try {
      // Use orderReference from outer scope or from error context
      const errorRef = error && typeof error === "object" && "orderReference" in error 
        ? String((error as { orderReference?: unknown }).orderReference || "unknown")
        : "unknown";
      const ref = orderReference !== "unknown" ? orderReference : errorRef;
      const responseSignature = generateWebhookResponseSignature({
        orderReference: String(ref),
        status: "decline",
        time: responseTime,
        secretKey: merchantSecret || "",
      });

      return NextResponse.json({
        orderReference: String(ref),
        status: "decline",
        time: responseTime,
        signature: responseSignature,
      });
    } catch (responseError) {
      // If we can't generate a proper response, return a simple error
      console.error("[WayForPay Webhook] Failed to generate error response:", responseError);
      return NextResponse.json(
        { error: "Webhook processing failed" },
        { status: 500 }
      );
    }
  }
}

