/**
 * KeyCRM: пошук/створення покупця за телефоном і створення замовлення.
 * Env: KEYCRM_API_KEY, KEYCRM_SOURCE_ID; опційно KEYCRM_BASE_URL, KEYCRM_DELIVERY_SERVICE_ID.
 */

const KEYCRM_BASE_URL =
  process.env.KEYCRM_BASE_URL?.trim() || "https://openapi.keycrm.app/v1";

export interface KeycrmOrderProduct {
  sku?: string;
  offer_id?: number;
  name?: string;
  price: number;
  purchased_price?: number;
  quantity: number;
  picture?: string;
  properties?: Array<{ name: string; value: string }>;
}

export interface KeycrmSyncOrderInput {
  buyer: {
    full_name: string;
    phone: string;
    email?: string | null;
  };
  products: KeycrmOrderProduct[];
  shipping?: {
    shipping_address_city?: string;
    shipping_address_country?: string;
    recipient_full_name?: string;
    recipient_phone?: string;
    warehouse_ref?: string;
    delivery_service_id?: number;
    shipping_receive_point?: string;
  };
  payments?: Array<{
    amount: number;
    status: "paid" | "not_paid" | "canceled" | "refund";
    payment_method?: string;
  }>;
  /** invoice_id сайту — дедуплікація */
  source_uuid: string;
  buyer_comment?: string | null;
}

interface Buyer {
  id: number;
  full_name: string | null;
  phone: string | null;
  email: string | null;
}

async function keycrmRequest<T>(
  method: "GET" | "POST" | "PUT",
  path: string,
  body?: unknown
): Promise<T> {
  const key = process.env.KEYCRM_API_KEY?.trim();
  if (!key) {
    throw new Error("KEYCRM_API_KEY is not set");
  }

  const url = `${KEYCRM_BASE_URL}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`KeyCRM ${method} ${path}: ${res.status} ${text}`);
  }

  return res.json() as Promise<T>;
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s()\-]/g, "");
}

/** 380XXXXXXXXX для фільтра KeyCRM */
function uaPhoneDigits(phone: string): string {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("380") && d.length >= 12) return d.slice(0, 12);
  if (d.startsWith("0") && d.length === 10) return `38${d}`;
  if (d.length === 9) return `380${d}`;
  return d;
}

async function findBuyerByPhone(phone: string): Promise<Buyer | null> {
  /** KeyCRM OpenAPI: дозволені фільтри `buyer_phone`, `buyer_email`, … — не `phone`. */
  type List = { data: Buyer[]; total: number };
  const variants = new Set<string>();
  const intl = uaPhoneDigits(phone);
  if (intl) variants.add(intl);
  const noPlus = normalizePhone(phone);
  if (noPlus) variants.add(noPlus);

  for (const candidate of variants) {
    const result = await keycrmRequest<List>(
      "GET",
      `/buyer?limit=5&filter[buyer_phone]=${encodeURIComponent(candidate)}`
    );
    if (result.data?.length) return result.data[0];
  }
  return null;
}

/** KeyCRM v1: у POST/PUT /buyer поля phone та email — масиви рядків. */
function buyerPhonesForApi(phone: string | undefined): string[] {
  if (!phone?.trim()) return [];
  return [normalizePhone(phone)];
}

function buyerEmailsForApi(email: string | undefined): string[] {
  if (!email?.trim()) return [];
  return [email.trim()];
}

async function createBuyer(payload: {
  full_name?: string;
  phone?: string;
  email?: string;
}): Promise<Buyer> {
  const body: Record<string, unknown> = {};
  if (payload.full_name != null) body.full_name = payload.full_name;
  body.phone = buyerPhonesForApi(payload.phone);
  body.email = buyerEmailsForApi(payload.email);
  return keycrmRequest<Buyer>("POST", "/buyer", body);
}

async function updateBuyer(
  buyerId: number,
  payload: Partial<{ full_name: string; phone: string; email: string }>
): Promise<Buyer> {
  const body: Record<string, unknown> = {};
  if (payload.full_name !== undefined) body.full_name = payload.full_name;
  if (payload.phone !== undefined) body.phone = buyerPhonesForApi(payload.phone);
  if (payload.email !== undefined) body.email = buyerEmailsForApi(payload.email);
  return keycrmRequest<Buyer>("PUT", `/buyer/${buyerId}`, body);
}

export async function findOrCreateKeycrmBuyer(input: {
  full_name: string;
  phone: string;
  email?: string | null;
}): Promise<number> {
  const existing = await findBuyerByPhone(input.phone);
  if (existing) {
    const updates: Partial<{ full_name: string; email: string }> = {};
    if (input.email && input.email !== existing.email) {
      updates.email = input.email;
    }
    if (
      input.full_name &&
      input.full_name.trim() !== (existing.full_name ?? "").trim()
    ) {
      updates.full_name = input.full_name.trim();
    }
    if (Object.keys(updates).length > 0) {
      await updateBuyer(existing.id, updates);
    }
    return existing.id;
  }

  const created = await createBuyer({
    full_name: input.full_name.trim(),
    phone: normalizePhone(input.phone),
    email: input.email?.trim() || undefined,
  });
  return created.id;
}

export function isKeycrmOrderConfigured(): boolean {
  return !!(
    process.env.KEYCRM_API_KEY?.trim() && process.env.KEYCRM_SOURCE_ID?.trim()
  );
}

/**
 * Створює замовлення в KeyCRM (покупець знаходиться або створюється за телефоном).
 */
export async function createKeycrmOrder(
  input: KeycrmSyncOrderInput
): Promise<{ buyerId: number; orderId: number }> {
  const sourceId = Number(process.env.KEYCRM_SOURCE_ID);
  if (!Number.isFinite(sourceId) || sourceId < 1) {
    throw new Error("KEYCRM_SOURCE_ID must be a positive integer");
  }

  const buyerId = await findOrCreateKeycrmBuyer(input.buyer);

  /** У тілі POST /order зазвичай залишають phone/email рядками, як у документації. */
  const orderPayload: Record<string, unknown> = {
    source_id: sourceId,
    buyer_id: buyerId,
    buyer: {
      full_name: input.buyer.full_name,
      phone: normalizePhone(input.buyer.phone),
      ...(input.buyer.email?.trim()
        ? { email: input.buyer.email.trim() }
        : {}),
    },
    products: input.products,
    source_uuid: input.source_uuid,
  };

  if (input.shipping) orderPayload.shipping = input.shipping;
  if (input.payments?.length) orderPayload.payments = input.payments;
  if (input.buyer_comment) orderPayload.buyer_comment = input.buyer_comment;

  const result = await keycrmRequest<{ id: number }>(
    "POST",
    "/order",
    orderPayload
  );
  if (!result?.id) {
    throw new Error("KeyCRM order response without id");
  }
  return { buyerId, orderId: result.id };
}
