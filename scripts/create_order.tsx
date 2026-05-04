/**
 * KeyCRM — Скрипт створення замовлення з перевіркою/створенням клієнта
 *
 * Base URL: https://openapi.keycrm.app/v1
 * Документація: https://docs.keycrm.app/
 *
 * Логіка:
 *  1. Шукаємо покупця по номеру телефону через GET /buyer?filter[buyer_phone]=...
 *  2. Якщо знайдено — оновлюємо email/ім'я якщо потрібно (PUT /buyer/{id})
 *  3. Якщо не знайдено — створюємо нового (POST /buyer)
 *  4. Створюємо замовлення з buyer_id (POST /order)
 *
 * ВАЖЛИВО: Встановіть ваш SOURCE_ID (ID джерела в KeyCRM).
 * Ліміт API: 60 запитів/хвилину.
 */

// ─── Конфігурація ────────────────────────────────────────────────────────────

const KEYCRM_API_KEY = "ODNjNTc5MTIyZDNmYjYwMGU1YWYwZjlmYzZiY2EwNzY0YjVkZTdkNA";
const KEYCRM_BASE_URL = "https://openapi.keycrm.app/v1";

// !! Замініть на реальний ID джерела зі свого KeyCRM (Налаштування → Джерела)
const SOURCE_ID = 1;

// ─── Типи ────────────────────────────────────────────────────────────────────

interface Buyer {
  id: number;
  full_name: string | null;
  phone: string | null;
  email: string | null;
}

interface BuyerCreatePayload {
  full_name?: string;
  phone?: string;
  email?: string;
}

interface OrderProduct {
  /** Артикул товару з каталогу (якщо є в каталозі — решта підтягнеться автоматично) */
  sku?: string;
  /** ID варіанту товару (offer_id) — альтернатива sku */
  offer_id?: number;
  name?: string;
  price: number;
  purchased_price?: number;
  quantity: number;
  picture?: string;
  properties?: Array<{ name: string; value: string }>;
}

interface OrderShipping {
  shipping_address_city?: string;
  shipping_address_country?: string;
  shipping_address_region?: string;
  shipping_address_zip?: string;
  shipping_secondary_line?: string;
  shipping_receive_point?: string;
  recipient_full_name?: string;
  recipient_phone?: string;
  /** UUID відділення Нової Пошти */
  warehouse_ref?: string;
  /** ID служби доставки в KeyCRM (обов'язково разом з warehouse_ref) */
  delivery_service_id?: number;
  shipping_date?: string;
}

interface OrderPayment {
  payment_method_id?: number;
  payment_method?: string;
  amount: number;
  description?: string;
  payment_date?: string;
  /** paid | not_paid | canceled | refund */
  status: "paid" | "not_paid" | "canceled" | "refund";
}

interface OrderCreateInput {
  buyer: {
    full_name?: string;
    /** Телефон у міжнародному форматі, напр: +380671234567 */
    phone: string;
    email?: string;
  };
  products: OrderProduct[];
  shipping?: OrderShipping;
  payments?: OrderPayment[];
  /** Зовнішній номер замовлення (з вашого сайту) — для дедуплікації */
  source_uuid?: string;
  /** Коментар покупця */
  buyer_comment?: string;
  /** Коментар менеджера */
  manager_comment?: string;
  /** ID менеджера в KeyCRM */
  manager_id?: number;
  /** Знижка на замовлення */
  discount?: number;
  custom_fields?: Array<{ uuid: string; value: unknown }>;
  marketing?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  };
}

// ─── HTTP-хелпер ─────────────────────────────────────────────────────────────

async function keycrmRequest<T>(
  method: "GET" | "POST" | "PUT",
  path: string,
  body?: unknown
): Promise<T> {
  const url = `${KEYCRM_BASE_URL}${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${KEYCRM_API_KEY}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `KeyCRM API error [${method} ${path}]: ${res.status} ${res.statusText}\n${errorText}`
    );
  }

  return res.json() as Promise<T>;
}

// ─── Функції роботи з покупцями ──────────────────────────────────────────────

/**
 * Шукає покупця за номером телефону.
 * Повертає першого знайденого або null.
 */
async function findBuyerByPhone(phone: string): Promise<Buyer | null> {
  // Нормалізуємо номер: прибираємо пробіли та дужки
  const normalizedPhone = phone.replace(/[\s()\-]/g, "");

  type BuyerListResponse = { data: Buyer[]; total: number };

  const result = await keycrmRequest<BuyerListResponse>(
    "GET",
    `/buyer?limit=5&filter[buyer_phone]=${encodeURIComponent(normalizedPhone)}`
  );

  if (result.data && result.data.length > 0) {
    console.log(`✅ Знайдено покупця з телефоном ${phone}: ID=${result.data[0].id}`);
    return result.data[0];
  }

  return null;
}

/**
 * Створює нового покупця в KeyCRM.
 */
async function createBuyer(payload: BuyerCreatePayload): Promise<Buyer> {
  console.log(`🆕 Створюємо нового покупця: ${payload.full_name} / ${payload.phone}`);
  const buyer = await keycrmRequest<Buyer>("POST", "/buyer", payload);
  console.log(`✅ Покупця створено: ID=${buyer.id}`);
  return buyer;
}

/**
 * Оновлює дані існуючого покупця (наприклад, якщо email змінився).
 */
async function updateBuyer(
  buyerId: number,
  payload: Partial<BuyerCreatePayload>
): Promise<Buyer> {
  console.log(`🔄 Оновлюємо покупця ID=${buyerId}`);
  const buyer = await keycrmRequest<Buyer>("PUT", `/buyer/${buyerId}`, payload);
  return buyer;
}

/**
 * Головна функція: знаходить або створює покупця.
 * Перевірка — по номеру телефону.
 * Якщо email відрізняється — оновлює.
 */
async function findOrCreateBuyer(input: OrderCreateInput["buyer"]): Promise<number> {
  const existingBuyer = await findBuyerByPhone(input.phone);

  if (existingBuyer) {
    // Оновлюємо email/ім'я, якщо вони прийшли і відрізняються
    const updates: Partial<BuyerCreatePayload> = {};

    if (input.email && input.email !== existingBuyer.email) {
      updates.email = input.email;
    }
    if (input.full_name && input.full_name !== existingBuyer.full_name) {
      updates.full_name = input.full_name;
    }

    if (Object.keys(updates).length > 0) {
      await updateBuyer(existingBuyer.id, updates);
    }

    return existingBuyer.id;
  }

  // Створюємо нового покупця
  const newBuyer = await createBuyer({
    full_name: input.full_name,
    phone: input.phone,
    email: input.email,
  });

  return newBuyer.id;
}

// ─── Функція створення замовлення ────────────────────────────────────────────

/**
 * Створює замовлення в KeyCRM.
 *
 * ВАЖЛИВО:
 * - source_id — обов'язковий (ID джерела в KeyCRM)
 * - buyer — обов'язковий, мінімум одне поле (phone/email/full_name)
 * - Ліміт: 60 запитів/хвилину
 */
async function createOrder(input: OrderCreateInput): Promise<{ id: number }> {
  // Крок 1: знайти або створити покупця
  const buyerId = await findOrCreateBuyer(input.buyer);

  // Крок 2: сформувати тіло замовлення
  const orderPayload: Record<string, unknown> = {
    source_id: SOURCE_ID,
    buyer_id: buyerId,
    // buyer блок дублюємо для автоматичного зв'язку (KeyCRM рекомендує)
    buyer: {
      full_name: input.buyer.full_name,
      phone: input.buyer.phone,
      email: input.buyer.email,
    },
    products: input.products,
  };

  if (input.shipping) orderPayload.shipping = input.shipping;
  if (input.payments) orderPayload.payments = input.payments;
  if (input.source_uuid) orderPayload.source_uuid = input.source_uuid;
  if (input.buyer_comment) orderPayload.buyer_comment = input.buyer_comment;
  if (input.manager_comment) orderPayload.manager_comment = input.manager_comment;
  if (input.manager_id) orderPayload.manager_id = input.manager_id;
  if (input.discount !== undefined) orderPayload.discount = input.discount;
  if (input.custom_fields) orderPayload.custom_fields = input.custom_fields;
  if (input.marketing) orderPayload.marketing = input.marketing;

  console.log(`📦 Створюємо замовлення для buyer_id=${buyerId}...`);

  const result = await keycrmRequest<{ id: number }>("POST", "/order", orderPayload);

  console.log(`✅ Замовлення створено: ID=${result.id}`);
  return result;
}

// ─── Приклад використання ────────────────────────────────────────────────────

async function main() {
  try {
    const order = await createOrder({
      buyer: {
        full_name: "Іваненко Іван Іванович",
        phone: "+380671234567",   // обов'язково
        email: "ivan@example.com",
      },
      products: [
        {
          // Якщо товар є в каталозі — достатньо sku + price + quantity
          sku: "PRODUCT-SKU-001",
          price: 1500,
          purchased_price: 900,
          quantity: 2,
          // Якщо товару немає в каталозі — вкажіть name вручну
          // name: "Назва товару",
        },
        {
          // Товар без артикулу (разовий)
          name: "Подарункове пакування",
          price: 50,
          quantity: 1,
        },
      ],
      shipping: {
        shipping_address_city: "Київ",
        shipping_address_country: "UA",
        shipping_address_region: "Київська область",
        // warehouse_ref: "uuid-відділення-нп",  // UUID відділення Нової Пошти
        // delivery_service_id: 5,               // ID служби доставки в KeyCRM
        recipient_full_name: "Іваненко Іван Іванович",
        recipient_phone: "+380671234567",
      },
      payments: [
        {
          amount: 3050,
          status: "not_paid",
          payment_method: "Карта",
        },
      ],
      source_uuid: "ORDER-12345",  // зовнішній номер замовлення (для дедуплікації)
      buyer_comment: "Подзвоніть перед доставкою",
    });

    console.log("\n🎉 Результат:", order);
  } catch (error) {
    console.error("❌ Помилка:", error);
    process.exit(1);
  }
}

main();