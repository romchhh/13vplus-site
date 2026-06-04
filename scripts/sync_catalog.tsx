/**
 * KeyCRM — синхронізація каталогу
 *
 * Base URL: https://openapi.keycrm.app/v1
 * Документація: https://docs.keycrm.app/
 *
 * Режими:
 *   push (за замовчуванням) — товари з вашої БД (Prisma) у KeyCRM для записів без keycrm_product_id
 *   pull — застарілий режим (лише консоль). Для імпорту в БД: npm run import-keycrm-catalog
 *
 * Змінні середовища (.env):
 *   DATABASE_URL          — для режиму push
 *   KEYCRM_API_KEY        — обовʼязково
 *   KEYCRM_BASE_URL       — опційно
 *   PUBLIC_URL            — абсолютні URL фото для KeyCRM (напр. https://13vplus.com)
 *   KEYCRM_CATEGORY_ID    — опційно, ID категорії в KeyCRM
 *   KEYCRM_WAREHOUSE_ID   — опційно, для оновлення залишків (PUT /offers/stocks)
 *
 * Запуск:
 *   npm run sync-catalog
 *   npm run sync-catalog -- pull
 *
 * Ліміт API: ~60 запитів/хв — затримка між сторінками/товарами в коді.
 */

import fs from "node:fs";
import path from "node:path";

// ─── .env ───────────────────────────────────────────────────────────────────

function loadEnvFromFile(): void {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

loadEnvFromFile();

const KEYCRM_BASE_URL =
  process.env.KEYCRM_BASE_URL ?? "https://openapi.keycrm.app/v1";
const PAGE_LIMIT = 50;
const REQUEST_DELAY_MS = 1100;

function getKeycrmApiKey(): string {
  const k = process.env.KEYCRM_API_KEY?.trim();
  if (!k) {
    throw new Error("KEYCRM_API_KEY is not set (додайте в .env)");
  }
  return k;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Типи (pull) ─────────────────────────────────────────────────────────────

interface KeyCRMProduct {
  id: number;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  media: Array<{ url: string }> | null;
  offers_count: number;
  created_at: string;
  updated_at: string;
  category: { id: number; name: string } | null;
}

interface KeyCRMOffer {
  id: number;
  product_id: number;
  sku: string | null;
  barcode: string | null;
  price: number | null;
  purchased_price: number | null;
  properties: Array<{ name: string; value: string }> | null;
  quantity: number;
  /** API v1 повертає in_reserve */
  in_reserve?: number;
  reserve?: number;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

async function keycrmGet<T>(path: string): Promise<T> {
  const url = `${KEYCRM_BASE_URL}${path}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${getKeycrmApiKey()}`,
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `KeyCRM API error [GET ${path}]: ${res.status} ${res.statusText}\n${errorText}`
    );
  }
  return res.json() as Promise<T>;
}

async function fetchAllProducts(): Promise<KeyCRMProduct[]> {
  const allProducts: KeyCRMProduct[] = [];
  let page = 1;
  let lastPage = 1;
  console.log("📦 Завантаження товарів з KeyCRM...");
  do {
    const path = `/products?limit=${PAGE_LIMIT}&page=${page}`;
    const response = await keycrmGet<PaginatedResponse<KeyCRMProduct>>(path);
    allProducts.push(...response.data);
    lastPage = response.last_page;
    console.log(
      `  Сторінка ${page}/${lastPage} — ${response.data.length} товарів (всього ${allProducts.length}/${response.total})`
    );
    if (page < lastPage) await sleep(REQUEST_DELAY_MS);
    page++;
  } while (page <= lastPage);
  console.log(`✅ Завантажено товарів: ${allProducts.length}`);
  return allProducts;
}

async function fetchAllOffers(): Promise<KeyCRMOffer[]> {
  const allOffers: KeyCRMOffer[] = [];
  let page = 1;
  let lastPage = 1;
  console.log("\n🏷️  Завантаження варіантів (offers) з KeyCRM...");
  do {
    const path = `/offers?limit=${PAGE_LIMIT}&page=${page}`;
    const response = await keycrmGet<PaginatedResponse<KeyCRMOffer>>(path);
    allOffers.push(...response.data);
    lastPage = response.last_page;
    console.log(
      `  Сторінка ${page}/${lastPage} — ${response.data.length} (всього ${allOffers.length}/${response.total})`
    );
    if (page < lastPage) await sleep(REQUEST_DELAY_MS);
    page++;
  } while (page <= lastPage);
  console.log(`✅ Завантажено варіантів: ${allOffers.length}`);
  return allOffers;
}

interface ProductRecord {
  keycrm_product_id: number;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  images: string[];
  category_id: number | null;
  category_name: string | null;
  created_at: string;
  updated_at: string;
}

interface OfferRecord {
  keycrm_offer_id: number;
  keycrm_product_id: number;
  sku: string | null;
  barcode: string | null;
  price: number | null;
  purchased_price: number | null;
  properties: Array<{ name: string; value: string }> | null;
  stock_available: number;
  stock_total: number;
  stock_reserved: number;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

async function saveProductsToDB(products: ProductRecord[]): Promise<void> {
  console.log(`\n💾 (pull) Товарів для збереження в БД: ${products.length} — заглушка`);
  for (const product of products) {
    console.log(
      `  [PRODUCT] id=${product.keycrm_product_id} | "${product.name}" | images: ${product.images.length}`
    );
  }
}

async function saveOffersToDB(offers: OfferRecord[]): Promise<void> {
  console.log(`\n💾 (pull) Варіантів для збереження в БД: ${offers.length} — заглушка`);
  for (const offer of offers) {
    console.log(
      `  [OFFER] id=${offer.keycrm_offer_id} | product_id=${offer.keycrm_product_id} | sku=${offer.sku}`
    );
  }
}

function transformProducts(products: KeyCRMProduct[]): ProductRecord[] {
  return products.map((p) => ({
    keycrm_product_id: p.id,
    name: p.name,
    description: p.description,
    thumbnail_url: p.thumbnail_url,
    images: p.media ? p.media.map((m) => m.url) : [],
    category_id: p.category?.id ?? null,
    category_name: p.category?.name ?? null,
    created_at: p.created_at,
    updated_at: p.updated_at,
  }));
}

function transformOffers(offers: KeyCRMOffer[]): OfferRecord[] {
  return offers.map((o) => {
    const reserved = o.in_reserve ?? o.reserve ?? 0;
    return {
      keycrm_offer_id: o.id,
      keycrm_product_id: o.product_id,
      sku: o.sku,
      barcode: o.barcode,
      price: o.price,
      purchased_price: o.purchased_price,
      properties: o.properties,
      stock_total: o.quantity,
      stock_reserved: reserved,
      stock_available: Math.max(0, o.quantity - reserved),
      thumbnail_url: o.thumbnail_url,
      created_at: o.created_at,
      updated_at: o.updated_at,
    };
  });
}

async function syncKeyCrmToConsole(): Promise<void> {
  console.log("🚀 Режим pull: KeyCRM → консоль (заглушка БД)\n");
  const start = Date.now();
  const rawProducts = await fetchAllProducts();
  const rawOffers = await fetchAllOffers();
  await saveProductsToDB(transformProducts(rawProducts));
  await saveOffersToDB(transformOffers(rawOffers));
  console.log(`\n🎉 Pull завершено за ${((Date.now() - start) / 1000).toFixed(1)}с`);
}

async function syncDbToKeyCrm(): Promise<void> {
  console.log("🚀 Режим push: БД → KeyCRM (лише товари без keycrm_product_id)\n");
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL не заданий у .env");
    process.exit(1);
  }
  getKeycrmApiKey();

  // CommonJS require після loadEnvFromFile() — без підняття import над .env
  /* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
  const { PrismaClient } = require("@prisma/client") as any;
  /* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaPg } = require("@prisma/adapter-pg");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pool } = require("pg");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { pushPendingProductsToKeyCrm } = require("../lib/keycrm-push-product");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : false,
  });
  const prisma = new PrismaClient({
    adapter: new PrismaPg(pool),
    log: ["error"],
  });
  try {
    await pushPendingProductsToKeyCrm(prisma);
    console.log("\n🎉 Push завершено");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

// ─── Запуск ───────────────────────────────────────────────────────────────────

const mode = process.argv[2] === "pull" ? "pull" : "push";

(mode === "pull" ? syncKeyCrmToConsole() : syncDbToKeyCrm()).catch((error) => {
  console.error("❌ Помилка:", error);
  process.exit(1);
});
