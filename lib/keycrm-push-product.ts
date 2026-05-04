import type { PrismaClient } from "@prisma/client";

type KeycrmSizeRow = { size: string; stock: number; dbRowId: number | null };
type DbSizeRow = { id: number; size: string; stock: number };

/** Стабільний порядок розмірів для першого SKU (як у каталозі) */
const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

function sizeRank(label: string): number {
  const u = label.trim().toUpperCase();
  const i = SIZE_ORDER.indexOf(u);
  if (i >= 0) return i;
  const n = Number.parseInt(u, 10);
  if (!Number.isNaN(n)) return 50 + n;
  return 200 + u.charCodeAt(0);
}

function sortDbSizesByGarmentOrder(rows: DbSizeRow[]): DbSizeRow[] {
  return [...rows].sort((a, b) => sizeRank(a.size) - sizeRank(b.size));
}

const KEYCRM_BASE_URL =
  process.env.KEYCRM_BASE_URL ?? "https://openapi.keycrm.app/v1";

const REQUEST_DELAY_MS = 1100;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getApiKey(): string {
  const key = process.env.KEYCRM_API_KEY;
  if (!key?.trim()) {
    throw new Error("KEYCRM_API_KEY is not set in environment");
  }
  return key.trim();
}

/**
 * Чи викликати push у KeyCRM після створення товару в адмінці (POST /api/products).
 * За замовчуванням — так, якщо в .env є KEYCRM_API_KEY.
 * Повністю вимкнути: KEYCRM_AUTO_SYNC=0 | false | no | off
 */
export function shouldPushProductToKeyCrmOnAdminSave(): boolean {
  if (!process.env.KEYCRM_API_KEY?.trim()) return false;
  const v = process.env.KEYCRM_AUTO_SYNC?.trim().toLowerCase();
  if (v === "0" || v === "false" || v === "no" || v === "off") return false;
  return true;
}

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
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `KeyCRM API error [${method} ${path}]: ${res.status} ${res.statusText}\n${errorText}`
    );
  }

  return res.json() as Promise<T>;
}

function sanitizeSkuPart(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/** Стабільний артикул для синхронізації з KeyCRM */
export function keycrmSkuForSize(localProductId: number, sizeLabel: string): string {
  return `13V-${localProductId}-${sanitizeSkuPart(sizeLabel)}`;
}

function publicBaseUrl(): string {
  const base =
    process.env.PUBLIC_URL?.replace(/\/$/, "") ||
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  return base;
}

function mediaToAbsoluteUrls(
  media: { type: string; url: string }[]
): string[] {
  const base = publicBaseUrl();
  return media
    .filter((m) => m.type === "photo")
    .map((m) => {
      const u = m.url.trim();
      if (u.startsWith("http://") || u.startsWith("https://")) return u;
      const path = u.startsWith("/") ? u : `/api/images/${u}`;
      return `${base}${path}`;
    })
    .slice(0, 6);
}

function extractProductIdFromCreateResponse(data: unknown): number {
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (typeof o.id === "number") return o.id;
    if (typeof o.product_id === "number") return o.product_id;
    const inner = o.data;
    if (inner && typeof inner === "object") {
      const d = inner as Record<string, unknown>;
      if (typeof d.id === "number") return d.id;
    }
  }
  throw new Error(
    `Unexpected KeyCRM POST /products response: ${JSON.stringify(data).slice(0, 500)}`
  );
}

interface OfferRow {
  id: number;
  sku: string | null;
}

interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
}

/** KeyCRM: GET /products/:id не підтримує include=offers — тягнемо /offers з фільтром */
async function fetchOffersByKeycrmProductId(
  keycrmProductId: number
): Promise<OfferRow[]> {
  const out: OfferRow[] = [];
  let page = 1;
  let lastPage = 1;
  do {
    const path = `/offers?limit=50&page=${page}&filter[product_id]=${keycrmProductId}`;
    const res = await keycrmRequest<Paginated<Record<string, unknown>>>(
      "GET",
      path
    );
    for (const item of res.data) {
      const id = item.id;
      const sku = item.sku;
      if (typeof id === "number") {
        out.push({ id, sku: typeof sku === "string" ? sku : null });
      }
    }
    lastPage = res.last_page;
    if (page < lastPage) await sleep(REQUEST_DELAY_MS);
    page++;
  } while (page <= lastPage);
  return out;
}

/** Якщо товар уже частково в CRM — шукаємо product_id по будь-якому з артикулів */
async function findExistingKeycrmProductIdByAnySku(
  localProductId: number,
  rows: KeycrmSizeRow[]
): Promise<number | null> {
  for (const row of rows) {
    const sku = keycrmSkuForSize(localProductId, row.size);
    const path = `/offers?limit=5&page=1&filter[sku]=${encodeURIComponent(sku)}`;
    const res = await keycrmRequest<Paginated<Record<string, unknown>>>(
      "GET",
      path
    );
    const first = res.data[0];
    if (first && typeof first.product_id === "number") {
      return first.product_id;
    }
    await sleep(400);
  }
  return null;
}

/**
 * Створює товар у KeyCRM за записом у вашій БД і зберігає keycrm_product_id / keycrm_offer_id.
 * Пропускає, якщо keycrmProductId вже заданий.
 */
export async function pushProductToKeyCrm(
  prisma: PrismaClient,
  localProductId: number
): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id: localProductId },
    include: {
      sizes: { orderBy: { id: "asc" } },
      media: { orderBy: { id: "asc" } },
    },
  });

  if (!product) {
    throw new Error(`Product id=${localProductId} not found`);
  }
  if (product.keycrmProductId != null) {
    return;
  }

  const price = Number(product.price);
  const pictures = mediaToAbsoluteUrls(product.media);
  const categoryId = process.env.KEYCRM_CATEGORY_ID
    ? Number(process.env.KEYCRM_CATEGORY_ID)
    : undefined;
  const category_id =
    categoryId !== undefined && !Number.isNaN(categoryId) ? categoryId : undefined;

  const dbSizes = product.sizes;
  /** Якщо розмірів немає в БД — один варіант OS у KeyCRM, рядки product_sizes не оновлюємо */
  const keycrmSizes: KeycrmSizeRow[] =
    dbSizes.length > 0
      ? sortDbSizesByGarmentOrder(dbSizes).map((s: DbSizeRow) => ({
          size: s.size,
          stock: s.stock,
          dbRowId: s.id,
        }))
      : [{ size: "OS", stock: 0, dbRowId: null }];

  const first = keycrmSizes[0]!;
  const firstSku = keycrmSkuForSize(product.id, first.size);

  let keycrmProductId = await findExistingKeycrmProductIdByAnySku(
    product.id,
    keycrmSizes
  );

  if (keycrmProductId == null) {
    const buildCreateBody = (name: string): Record<string, unknown> => {
      const cur = (product.currencyCode || "UAH").toUpperCase();
      const purchased =
        product.wholesalePrice != null
          ? Number(product.wholesalePrice)
          : undefined;
      const b: Record<string, unknown> = {
        name,
        description: product.description ?? "",
        currency_code: cur,
        sku: firstSku,
        price,
        pictures: pictures.length ? pictures : undefined,
        unit_type: product.unitType || "шт",
      };
      if (purchased !== undefined && !Number.isNaN(purchased)) {
        b.purchased_price = purchased;
      }
      const wkg = product.weightKg != null ? Number(product.weightKg) : undefined;
      if (wkg !== undefined && !Number.isNaN(wkg)) b.weight = wkg;
      const len = product.lengthCm != null ? Number(product.lengthCm) : undefined;
      if (len !== undefined && !Number.isNaN(len)) b.length = len;
      const wid = product.widthCm != null ? Number(product.widthCm) : undefined;
      if (wid !== undefined && !Number.isNaN(wid)) b.width = wid;
      const h = product.heightCm != null ? Number(product.heightCm) : undefined;
      if (h !== undefined && !Number.isNaN(h)) b.height = h;
      if (category_id !== undefined) {
        b.category_id = category_id;
      }
      return b;
    };

    let createBody = buildCreateBody(product.name);
    let created: unknown;
    try {
      created = await keycrmRequest<unknown>("POST", "/products", createBody);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("422") && msg.includes("name")) {
        createBody = buildCreateBody(`${product.name} [#${product.id}]`);
        created = await keycrmRequest<unknown>("POST", "/products", createBody);
      } else {
        throw err;
      }
    }
    keycrmProductId = extractProductIdFromCreateResponse(created);

    const restSizes = keycrmSizes.slice(1);
    if (restSizes.length > 0) {
      await sleep(REQUEST_DELAY_MS);
      const purchasedOffer =
        product.wholesalePrice != null
          ? Number(product.wholesalePrice)
          : undefined;
      await keycrmRequest("POST", `/products/${keycrmProductId}/offers`, {
        offers: restSizes.map((row: KeycrmSizeRow) => ({
          sku: keycrmSkuForSize(product.id, row.size),
          price,
          purchased_price:
            purchasedOffer !== undefined && !Number.isNaN(purchasedOffer)
              ? purchasedOffer
              : undefined,
          properties: [{ name: "Розмір", value: row.size }],
        })),
      });
    }
  } else {
    const existing = await fetchOffersByKeycrmProductId(keycrmProductId);
    const existingSkus = new Set(
      existing.map((o) => o.sku).filter((s): s is string => Boolean(s))
    );
    const missing = keycrmSizes.filter(
      (row) => !existingSkus.has(keycrmSkuForSize(product.id, row.size))
    );
    if (missing.length > 0) {
      await sleep(REQUEST_DELAY_MS);
      const purchasedOffer2 =
        product.wholesalePrice != null
          ? Number(product.wholesalePrice)
          : undefined;
      await keycrmRequest("POST", `/products/${keycrmProductId}/offers`, {
        offers: missing.map((row: KeycrmSizeRow) => ({
          sku: keycrmSkuForSize(product.id, row.size),
          price,
          purchased_price:
            purchasedOffer2 !== undefined && !Number.isNaN(purchasedOffer2)
              ? purchasedOffer2
              : undefined,
          properties: [{ name: "Розмір", value: row.size }],
        })),
      });
    }
  }

  await sleep(REQUEST_DELAY_MS);
  const offerRows = await fetchOffersByKeycrmProductId(keycrmProductId);
  const skuToOfferId = new Map<string, number>();
  for (const row of offerRows) {
    if (row.sku) skuToOfferId.set(row.sku, row.id);
  }

  const warehouseRaw = process.env.KEYCRM_WAREHOUSE_ID;
  const warehouseId =
    warehouseRaw !== undefined && warehouseRaw !== ""
      ? Number(warehouseRaw)
      : NaN;
  if (!Number.isNaN(warehouseId) && warehouseId > 0) {
    await sleep(REQUEST_DELAY_MS);
    await keycrmRequest("PUT", "/offers/stocks", {
      warehouse_id: warehouseId,
      stocks: keycrmSizes.map((row: KeycrmSizeRow) => ({
        sku: keycrmSkuForSize(product.id, row.size),
        quantity: row.stock,
      })),
    });
  }

  const sizeUpdates = keycrmSizes
    .filter((row): row is KeycrmSizeRow & { dbRowId: number } => row.dbRowId != null)
    .map((row) => {
      const sku = keycrmSkuForSize(product.id, row.size);
      const offerId = skuToOfferId.get(sku);
      return prisma.productSize.update({
        where: { id: row.dbRowId },
        data: { keycrmOfferId: offerId ?? null },
      });
    });

  await prisma.$transaction([
    ...sizeUpdates,
    prisma.product.update({
      where: { id: product.id },
      data: { keycrmProductId },
    }),
  ]);
}

/** Усі товари без keycrm_product_id — по черзі відправляються в KeyCRM */
export async function pushPendingProductsToKeyCrm(prisma: PrismaClient): Promise<void> {
  const pending = await prisma.product.findMany({
    where: { keycrmProductId: null },
    orderBy: { id: "asc" },
    select: { id: true },
  });

  console.log(`Товарів без KeyCRM: ${pending.length}`);

  for (let i = 0; i < pending.length; i++) {
    const { id } = pending[i]!;
    console.log(`  [${i + 1}/${pending.length}] Експорт product id=${id}...`);
    try {
      await pushProductToKeyCrm(prisma, id);
      console.log(`    OK id=${id}`);
    } catch (e) {
      console.error(`    Помилка id=${id}:`, e);
      throw e;
    }
    if (i < pending.length - 1) {
      await sleep(REQUEST_DELAY_MS);
    }
  }
}
