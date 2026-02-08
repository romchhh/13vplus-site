import { NextRequest, NextResponse } from "next/server";
import { sqlGetOrderByInvoiceId } from "@/lib/sql";

type RouteParams = {
  params: Promise<{
    invoiceId: string;
  }>;
};

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { invoiceId } = await params;

    if (!invoiceId) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    const order = await sqlGetOrderByInvoiceId(invoiceId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Післяоплата — замовлення вже оформлено, показуємо його без очікування оплати
    if (order.payment_status !== "paid" && order.payment_type !== "pay_after") {
      return NextResponse.json(
        { error: "Payment not completed", payment_status: order.payment_status },
        { status: 409 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("[GET /orders/invoice] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order by invoice" },
      { status: 500 }
    );
  }
}

