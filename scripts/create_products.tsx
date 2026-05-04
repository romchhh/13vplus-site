/**
 * СКРИПТ 2: Отримання товарів із KeyCRM каталогу → запис у БД
 * ─────────────────────────────────────────────────────────────
 * - Отримує всі товари та їх варіанти з KeyCRM
 * - Записує/оновлює товари в локальній БД
 *
 * БД: PostgreSQL (через pg)
 * Запуск: npx ts-node 2_products_from_crm.ts
 */

import { Pool } from "pg";

// ─── Конфігурація ──────────────────────────────────────────────────────────────
const KEYCRM_API_KEY = "ODNjNTc5MTIyZDNmYjYwMGU1YWYwZjlmYzZiY2EwNzY0YjVkZTdkNA==";
const KEYCRM_BASE_URL = "https://openapi.keycrm.app/v1";
const PAGE_LIMIT = 50;

const db = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "shop_db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
});

// ─── Типи ──────────────────────────────────────────────────────────────────────
interface KeyCrmOffer {
  id: number;
  sku: string | null;
  barcode: string | null;
  price: number | null;
  purchased_price: number | null;
  quantity: number | null;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  thumbnail: string | null;
  properties: { name: string; value: string }[];
}

interface KeyCrmProduct {
  id: number;
  name: string;
  description: string | null;
  category: { id: number; name: string } | null;
  thumbnail: string | null;
  currency_code: string | null;
  price: number | null;
  purchased_price: number | null;
  min_price: number | null;
  max_price: number | null;
  quantity: number | null;
  unit: string | null;
  has_offers: boolean;
  offers: KeyCrmOffer[];
  created_at: string;
  updated_at: string;
}

// ─── API helper ───────────────────────────────────────────────────────────────
async function keyCrmFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${KEYCRM_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${KEYCRM_API_KEY}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`KeyCRM API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

async function fetchAllProducts(): Promise<KeyCrmProduct[]> {
  const products: KeyCrmProduct[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const data = await keyCrmFetch<{
      data: KeyCrmProduct[];
      meta: { last_page: number; total: number };
    }>(`/products?include=offers,category&limit=${PAGE_LIMIT}&page=${page}`);

    products.push(...data.data);
    totalPages = data.meta.last_page;
    console.log(`  Сторінка ${page}/${totalPages}, отримано ${data.data.length} товарів`);
    page++;

    if (page <= totalPages) await sleep(1100);
  }

  return products;
}

// ─── БД операції ──────────────────────────────────────────────────────────────
async function upsertProduct(product: KeyCrmProduct): Promise<number> {
  const existing = await db.query(
    `SELECT id FROM products WHERE keycrm_id = $1 LIMIT 1`,
    [product.id]
  );

  if (existing.rows.length > 0) {
    await db.query(
      `UPDATE products SET
         name = $2, description = $3, category_name = $4,
         currency_code = $5, price = $6, purchased_price = $7,
         quantity = $8, unit = $9, thumbnail = $10,
         has_variants = $11, updated_at = NOW()
       WHERE keycrm_id = $1`,
      [
        product.id,
        product.name,
        product.description,
        product.category?.name ?? null,
        product.currency_code ?? "UAH",
        product.price ?? null,
        product.purchased_price ?? null,
        product.quantity ?? null,
        product.unit ?? null,
        product.thumbnail ?? null,
        product.has_offers,
      ]
    );
    return existing.rows[0].id as number;
  }

  const result = await db.query(
    `INSERT INTO products (
       keycrm_id, name, description, category_name,
       currency_code, price, purchased_price, quantity,
       unit, thumbnail, has_variants, created_at, updated_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),NOW())
     RETURNING id`,
    [
      product.id,
      product.name,
      product.description,
      product.category?.name ?? null,
      product.currency_code ?? "UAH",
      product.price ?? null,
      product.purchased_price ?? null,
      product.quantity ?? null,
      product.unit ?? null,
      product.thumbnail ?? null,
      product.has_offers,
    ]
  );
  return result.rows[0].id as number;
}

async function upsertOffer(localProductId: number, offer: KeyCrmOffer) {
  const props = offer.properties?.map((p) => `${p.name}: ${p.value}`).join(", ") ?? null;

  const existing = await db.query(
    `SELECT id FROM product_variants WHERE keycrm_offer_id = $1 LIMIT 1`,
    [offer.id]
  );

  if (existing.rows.length > 0) {
    await db.query(
      `UPDATE product_variants SET
         sku = $2, barcode = $3, price = $4, purchased_price = $5,
         quantity = $6, weight = $7, length = $8, width = $9, height = $10,
         thumbnail = $11, properties = $12, updated_at = NOW()
       WHERE keycrm_offer_id = $1`,
      [
        offer.id, offer.sku, offer.barcode, offer.price, offer.purchased_price,
        offer.quantity, offer.weight, offer.length, offer.width, offer.height,
        offer.thumbnail, props,
      ]
    );
  } else {
    await db.query(
      `INSERT INTO product_variants (
         product_id, keycrm_offer_id, sku, barcode,
         price, purchased_price, quantity,
         weight, length, width, height,
         thumbnail, properties, created_at, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW(),NOW())`,
      [
        localProductId, offer.id, offer.sku, offer.barcode,
        offer.price, offer.purchased_price, offer.quantity,
        offer.weight, offer.length, offer.width, offer.height,
        offer.thumbnail, props,
      ]
    );
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Головна функція ──────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Синхронізація товарів KeyCRM → БД\n");

  try {
    await db.query("SELECT 1");
    console.log("✅ Підключення до БД успішне\n");

    console.log("📥 Завантаження товарів з KeyCRM...");
    const products = await fetchAllProducts();
    console.log(`\n📦 Всього товарів: ${products.length}\n`);

    let created = 0, updated = 0, variantsTotal = 0, errors = 0;

    for (const product of products) {
      try {
        const existingBefore = await db.query(
          `SELECT id FROM products WHERE keycrm_id = $1`,
          [product.id]
        );
        const isNew = existingBefore.rows.length === 0;

        const localId = await upsertProduct(product);

        // Записуємо варіанти (offers)
        if (product.offers?.length > 0) {
          for (const offer of product.offers) {
            await upsertOffer(localId, offer);
            variantsTotal++;
          }
        }

        if (isNew) { created++; }
        else { updated++; }

        console.log(
          `  ${isNew ? "✅" : "🔄"} "${product.name}" — ${product.offers?.length ?? 0} варіантів`
        );

      } catch (err) {
        errors++;
        console.error(`  ❌ Помилка для "${product.name}" (#${product.id}):`, err);
      }
    }

    console.log(`\n📊 Результат:`);
    console.log(`   Товарів створено: ${created}`);
    console.log(`   Товарів оновлено: ${updated}`);
    console.log(`   Варіантів всього: ${variantsTotal}`);
    console.log(`   Помилок:          ${errors}`);

  } finally {
    await db.end();
  }
}

main().catch(console.error);