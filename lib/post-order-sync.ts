import { prisma } from "@/lib/prisma";
import {
  createKeycrmOrder,
  isKeycrmOrderConfigured,
  type KeycrmOrderProduct,
} from "@/lib/keycrm-order";
import {
  createNovaPoshtaTtn,
  getNovaPoshtaTracking,
  isNovaPoshtaConfiguredForTtn,
} from "@/lib/nova-poshta";

type NormalizedItem = {
  product_id: number;
  product_name: string;
  size: string;
  quantity: number;
  price: number;
  color: string | null;
};

async function buildKeycrmProducts(
  items: NormalizedItem[]
): Promise<KeycrmOrderProduct[]> {
  const out: KeycrmOrderProduct[] = [];
  for (const it of items) {
    const ps = await prisma.productSize.findFirst({
      where: { productId: it.product_id, size: it.size },
      include: { product: { select: { name: true } } },
    });
    const baseName =
      ps?.product?.name?.trim() || it.product_name || `Товар #${it.product_id}`;
    const variant = `${it.size}${it.color ? `, ${it.color}` : ""}`;
    const line: KeycrmOrderProduct = {
      price: it.price,
      quantity: it.quantity,
      properties: [{ name: "Варіант", value: variant }],
    };
    if (ps?.keycrmOfferId) {
      line.offer_id = ps.keycrmOfferId;
    } else {
      line.name = `${baseName} (${variant})`;
    }
    out.push(line);
  }
  return out;
}

/**
 * Після збереження замовлення в БД: KeyCRM + ТТН НП (помилки лише в лог, чекаут не ламаємо).
 */
export async function runPostOrderIntegrations(input: {
  dbOrderId: number;
  invoiceId: string;
  customerName: string;
  phoneNumber: string;
  email: string | null | undefined;
  city: string;
  postOffice: string;
  deliveryMethod: string;
  cityRef?: string | null;
  warehouseRef?: string | null;
  comment?: string | null;
  /** Сума товарів після знижок (грн) — для оцінки вартості в НП та KeyCRM */
  orderTotal: number;
  paymentStatus: "pending" | "paid" | "canceled";
  normalizedItems: NormalizedItem[];
}): Promise<void> {
  const {
    dbOrderId,
    invoiceId,
    customerName,
    phoneNumber,
    email,
    city,
    postOffice,
    deliveryMethod,
    cityRef,
    warehouseRef,
    comment,
    orderTotal,
    paymentStatus,
    normalizedItems,
  } = input;

  if (isKeycrmOrderConfigured()) {
    try {
      const products = await buildKeycrmProducts(normalizedItems);
      const deliveryServiceIdRaw = process.env.KEYCRM_DELIVERY_SERVICE_ID?.trim();
      const deliveryServiceId = deliveryServiceIdRaw
        ? Number(deliveryServiceIdRaw)
        : NaN;
      const hasNpWarehouse =
        deliveryMethod.startsWith("nova_poshta") &&
        warehouseRef &&
        Number.isFinite(deliveryServiceId);

      const shipping = {
        shipping_address_city: city,
        shipping_address_country: "UA",
        recipient_full_name: customerName.trim(),
        recipient_phone: phoneNumber,
        shipping_receive_point: postOffice,
        ...(hasNpWarehouse
          ? {
              warehouse_ref: warehouseRef!,
              delivery_service_id: deliveryServiceId,
            }
          : {}),
      };

      const payStatus =
        paymentStatus === "paid" ? ("paid" as const) : ("not_paid" as const);

      const { buyerId, orderId } = await createKeycrmOrder({
        buyer: {
          full_name: customerName.trim(),
          phone: phoneNumber,
          email: email || undefined,
        },
        products,
        shipping,
        payments: [
          {
            amount: Math.max(0, Math.round(orderTotal * 100) / 100),
            status: payStatus,
            payment_method: "Сайт",
          },
        ],
        source_uuid: invoiceId,
        buyer_comment: comment || undefined,
      });

      await prisma.order.update({
        where: { id: dbOrderId },
        data: { keycrmBuyerId: buyerId, keycrmOrderId: orderId },
      });
    } catch (e) {
      console.error("[post-order-sync] KeyCRM:", e);
    }
  }

  if (
    deliveryMethod.startsWith("nova_poshta") &&
    isNovaPoshtaConfiguredForTtn()
  ) {
    try {
      let serviceType = "WarehouseWarehouse";
      if (deliveryMethod === "nova_poshta_courier") {
        serviceType = "WarehouseDoors";
      }

      const result = await createNovaPoshtaTtn({
        recipientName: customerName,
        recipientPhone: phoneNumber,
        cityName: city,
        warehouseDescription: postOffice,
        cityRef: cityRef || undefined,
        warehouseRef: warehouseRef || undefined,
        cost: Math.max(1, Math.round(orderTotal)),
        description: `Замовлення ${invoiceId}`,
        serviceType,
      });

      if ("error" in result) {
        console.error("[post-order-sync] NP TTN:", result.error);
        return;
      }

      const track = await getNovaPoshtaTracking(
        result.ttn,
        phoneNumber
      ).catch(() => null);

      await prisma.order.update({
        where: { id: dbOrderId },
        data: {
          novaPoshtaTtn: result.ttn,
          novaPoshtaDocumentRef: result.documentRef ?? null,
          npStatusCode: track?.code ?? null,
          npStatusName: track?.name ?? null,
        },
      });
    } catch (e) {
      console.error("[post-order-sync] Nova Poshta:", e);
    }
  }
}
