/**
 * Імпорт каталогу KeyCRM → локальна БД (товари, варіанти, категорії, фото)
 *
 * Змінні середовища (.env):
 *   DATABASE_URL     — PostgreSQL
 *   KEYCRM_API_KEY   — обовʼязково
 *   KEYCRM_BASE_URL  — опційно (за замовчуванням https://openapi.keycrm.app/v1)
 *
 * Опції:
 *   --dry-run              — без запису в БД і без завантаження фото
 *   --skip-images          — не завантажувати зображення
 *   --product-id=273       — імпортувати групу, до якої належить цей товар KeyCRM
 *   --skip-archived        — пропустити архівні товари
 *   --limit=5              — імпортувати лише перші N груп товарів
 *   --reset-catalog        — очистити каталог перед імпортом (разом з --limit)
 *
 * Товари з розміром у назві (… (M), … XS) обʼєднуються в один товар на сайті.
 *
 * Запуск:
 *   npm run import-keycrm-catalog
 *   npm run import-keycrm-catalog -- --dry-run
 *   npm run import-keycrm-catalog -- --product-id=273
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";
import {
  COLOR_PROP_NAMES as COLOR_PROP_NAMES_IMPORTED,
  modelNameFromKeycrmName,
  productGroupKey,
  propValue,
  sizeFromName,
  sizeFromSku,
  variantGroupKeyFromName,
  colorFromProductName,
  variantLabelFromName,
} from "../lib/productNameParsing";

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
const UPLOAD_DIR = path.join(process.cwd(), "product-images");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const SKIP_IMAGES = args.includes("--skip-images");
const SKIP_ARCHIVED = args.includes("--skip-archived");
const PRODUCT_ID_ARG = args.find((a) => a.startsWith("--product-id="));
const SINGLE_PRODUCT_ID = PRODUCT_ID_ARG
  ? Number(PRODUCT_ID_ARG.split("=")[1])
  : null;
const LIMIT_ARG = args.find((a) => a.startsWith("--limit="));
const IMPORT_LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split("=")[1]) : null;
const RESET_CATALOG = args.includes("--reset-catalog");

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

// ─── KeyCRM типи ─────────────────────────────────────────────────────────────

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

interface KeycrmCategory {
  id: number;
  name: string;
  parent_id: number | null;
}

interface KeycrmProductListItem {
  id: number;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  attachments_data: string[] | null;
  quantity: number;
  in_reserve?: number;
  unit_type: string | null;
  currency_code: string;
  min_price: number | null;
  max_price: number | null;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  has_offers: boolean;
  is_archived: boolean;
  category_id: number | null;
}

interface KeycrmProductDetail extends KeycrmProductListItem {
  sku: string | null;
  price: number | null;
  purchased_price: number | null;
}

interface KeycrmOffer {
  id: number;
  product_id: number;
  sku: string | null;
  barcode: string | null;
  price: number | null;
  purchased_price: number | null;
  quantity: number;
  in_reserve?: number;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  thumbnail_url: string | null;
  properties: Array<{ name: string; value: string }> | null;
  is_archived?: boolean;
}

interface LocalCategoryRef {
  categoryId: number;
  subcategoryId: number | null;
}

interface CategoryContext {
  mapping: Map<number, LocalCategoryRef>;
  categories: KeycrmCategory[];
  pathFromRoot: (id: number) => KeycrmCategory[];
  depth: (id: number) => number;
}

function createCategoryContext(
  categories: KeycrmCategory[],
  mapping: Map<number, LocalCategoryRef>
): CategoryContext {
  const { pathFromRoot, depth } = buildCategoryMaps(categories);
  return { mapping, categories, pathFromRoot, depth };
}

function normalizeNameToken(value: string): string {
  return value.toLowerCase().replace(/['"«»]/g, "").trim();
}

const UKRAINIAN_PLURAL_SUFFIXES = ["ки", "ок", "ек", "и", "і", "я"] as const;

/** Ключові слова в назві товару → стеми назв категорій KeyCRM */
const PRODUCT_TYPE_CATEGORY_STEMS: Array<[string, string[]]> = [
  ["майка", ["футбол"]],
  ["футболка", ["футбол"]],
  ["сукня", ["сукн"]],
  ["сукні", ["сукн"]],
  ["халат", ["сороч"]],
  ["кімоно", ["сороч"]],
  ["туніка", ["сороч"]],
  ["сорочка", ["сороч"]],
  ["костюм", ["костюм"]],
  ["штани", ["штан"]],
  ["шорти", ["штан"]],
  ["легінси", ["легін"]],
  ["легgings", ["легін"]],
  ["джинси", ["джинс"]],
  ["худі", ["худ"]],
  ["лонгслів", ["лонгсл", "кофт"]],
  ["лонгслив", ["лонгсл", "кофт"]],
  ["джемпер", ["джемпер", "кофт"]],
  ["кофта", ["кофт"]],
  ["куртка", ["верхн"]],
  ["пальто", ["верхн"]],
  ["жилет", ["верхн"]],
];

function categoryNameStems(categoryName: string): string[] {
  const normalized = normalizeNameToken(categoryName);
  const stems = new Set<string>();
  if (normalized.length >= 4) stems.add(normalized);

  const addStemVariants = (token: string) => {
    if (token.length >= 4) stems.add(token);
    for (const suffix of UKRAINIAN_PLURAL_SUFFIXES) {
      if (token.length > suffix.length + 3 && token.endsWith(suffix)) {
        stems.add(token.slice(0, -suffix.length));
      }
    }
  };

  for (const token of normalized.split(/\s+/)) {
    addStemVariants(token);
  }
  return [...stems].filter((s) => s.length >= 4);
}

function stemsOverlap(a: string, b: string): boolean {
  return a.includes(b) || b.includes(a);
}

/** Довжина найкращого співпадіння назви товару з назвою категорії (0 = немає) */
function categoryMatchScore(productName: string, categoryName: string): number {
  const product = normalizeNameToken(productName);
  if (!product) return 0;

  let best = 0;
  const categoryStems = categoryNameStems(categoryName);
  for (const stem of categoryStems) {
    if (product.includes(stem)) best = Math.max(best, stem.length);
  }

  for (const [keyword, targetStems] of PRODUCT_TYPE_CATEGORY_STEMS) {
    if (!product.includes(keyword)) continue;
    for (const target of targetStems) {
      if (categoryStems.some((stem) => stemsOverlap(stem, target))) {
        best = Math.max(best, target.length);
      }
    }
  }

  return best;
}

function nameMatchesCategory(productName: string, categoryName: string): boolean {
  return categoryMatchScore(productName, categoryName) > 0;
}

/** Підбір підкатегорії за назвою товару серед категорій KeyCRM */
function inferCategoryFromName(
  productName: string,
  ctx: CategoryContext,
  preferKeycrmRootId?: number
): LocalCategoryRef | null {
  const candidates = ctx.categories.filter((c) => c.parent_id != null).filter((c) => {
    if (preferKeycrmRootId == null) return true;
    return ctx.pathFromRoot(c.id)[0]?.id === preferKeycrmRootId;
  });

  let bestRef: LocalCategoryRef | null = null;
  let bestScore = 0;
  let bestDepth = 0;

  for (const cat of candidates) {
    const chain = ctx.pathFromRoot(cat.id);
    let score = 0;
    for (const segment of chain.slice(1)) {
      score = Math.max(score, categoryMatchScore(productName, segment.name));
    }
    if (score === 0) continue;

    const depth = ctx.depth(cat.id);
    if (
      score > bestScore ||
      (score === bestScore && depth > bestDepth)
    ) {
      const ref = ctx.mapping.get(cat.id);
      if (ref) {
        bestScore = score;
        bestDepth = depth;
        bestRef = ref;
      }
    }
  }

  return bestRef;
}

function resolveCategoryForGroup(
  members: KeycrmProductListItem[],
  productName: string,
  ctx: CategoryContext
): LocalCategoryRef | null {
  let bestKeycrmCategoryId: number | null = null;
  let bestDepth = 0;

  for (const member of members) {
    if (member.category_id == null) continue;
    const memberDepth = ctx.depth(member.category_id);
    if (memberDepth > bestDepth) {
      bestDepth = memberDepth;
      bestKeycrmCategoryId = member.category_id;
    }
  }

  if (bestKeycrmCategoryId != null) {
    const direct = ctx.mapping.get(bestKeycrmCategoryId);
    if (direct?.subcategoryId) return direct;

    const keycrmRootId = ctx.pathFromRoot(bestKeycrmCategoryId)[0]?.id;
    const inferred = inferCategoryFromName(productName, ctx, keycrmRootId);
    if (inferred) return inferred;
    if (direct) return direct;
  }

  return inferCategoryFromName(productName, ctx);
}

// ─── API ─────────────────────────────────────────────────────────────────────

async function keycrmGet<T>(apiPath: string): Promise<T> {
  const url = `${KEYCRM_BASE_URL}${apiPath}`;
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
      `KeyCRM API error [GET ${apiPath}]: ${res.status} ${res.statusText}\n${errorText}`
    );
  }
  return res.json() as Promise<T>;
}

async function fetchAllPaginated<T>(
  label: string,
  buildPath: (page: number) => string
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let lastPage = 1;
  console.log(`📥 ${label}...`);
  do {
    const response = await keycrmGet<PaginatedResponse<T>>(buildPath(page));
    all.push(...response.data);
    lastPage = response.last_page;
    console.log(
      `  стор. ${page}/${lastPage} — ${response.data.length} (всього ${all.length}/${response.total})`
    );
    if (page < lastPage) await sleep(REQUEST_DELAY_MS);
    page++;
  } while (page <= lastPage);
  return all;
}

// ─── Категорії ───────────────────────────────────────────────────────────────

function buildCategoryMaps(categories: KeycrmCategory[]) {
  const byId = new Map<number, KeycrmCategory>();
  for (const c of categories) byId.set(c.id, c);

  function pathFromRoot(catId: number): KeycrmCategory[] {
    const chain: KeycrmCategory[] = [];
    let cur: KeycrmCategory | undefined = byId.get(catId);
    while (cur) {
      chain.unshift(cur);
      cur = cur.parent_id != null ? byId.get(cur.parent_id) : undefined;
    }
    return chain;
  }

  function depth(catId: number): number {
    return pathFromRoot(catId).length;
  }

  return { byId, pathFromRoot, depth };
}

async function syncCategories(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prisma: any,
  categories: KeycrmCategory[]
): Promise<Map<number, LocalCategoryRef>> {
  const mapping = new Map<number, LocalCategoryRef>();
  const { pathFromRoot, depth } = buildCategoryMaps(categories);

  const roots = categories
    .filter((c) => c.parent_id === null)
    .sort((a, b) => a.id - b.id);

  console.log(`\n📂 Категорії KeyCRM: ${categories.length} (кореневих: ${roots.length})`);

  for (const root of roots) {
    if (DRY_RUN) {
      mapping.set(root.id, { categoryId: -root.id, subcategoryId: null });
      console.log(`  [dry-run] категорія: "${root.name}"`);
      continue;
    }

    let local = await prisma.category.findFirst({ where: { name: root.name } });
    if (!local) {
      local = await prisma.category.create({
        data: { name: root.name, priority: 0 },
      });
      console.log(`  ✅ створено категорію: "${root.name}" (id=${local.id})`);
    } else {
      console.log(`  ↪ категорія вже є: "${root.name}" (id=${local.id})`);
    }
    mapping.set(root.id, { categoryId: local.id, subcategoryId: null });
  }

  const nonRoots = categories
    .filter((c) => c.parent_id !== null)
    .sort((a, b) => depth(a.id) - depth(b.id));

  for (const cat of nonRoots) {
    const chain = pathFromRoot(cat.id);
    if (chain.length < 2) continue;

    const root = chain[0]!;
    const rootRef = mapping.get(root.id);
    if (!rootRef) continue;

    const subName = chain.slice(1).map((c) => c.name).join(" / ");

    if (DRY_RUN) {
      mapping.set(cat.id, {
        categoryId: rootRef.categoryId,
        subcategoryId: -cat.id,
      });
      console.log(`  [dry-run] підкатегорія: "${root.name}" → "${subName}"`);
      continue;
    }

    let sub = await prisma.subcategory.findFirst({
      where: { categoryId: rootRef.categoryId, name: subName },
    });
    if (!sub) {
      sub = await prisma.subcategory.create({
        data: { name: subName, categoryId: rootRef.categoryId },
      });
      console.log(`  ✅ підкатегорія: "${subName}" (id=${sub.id})`);
    }

    mapping.set(cat.id, {
      categoryId: rootRef.categoryId,
      subcategoryId: sub.id,
    });
  }

  return mapping;
}

// ─── Зображення ──────────────────────────────────────────────────────────────

const imageUrlCache = new Map<string, string>();

function localFilenameFromSiteUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/\/api\/images\/([^/?#]+)$/i);
    if (m?.[1]) return m[1];
  } catch {
    /* ignore */
  }
  return null;
}

async function downloadImageAsWebp(url: string): Promise<string | null> {
  const cached = imageUrlCache.get(url);
  if (cached) return cached;

  const existingLocal = localFilenameFromSiteUrl(url);
  if (existingLocal) {
    const fp = path.join(UPLOAD_DIR, existingLocal);
    if (fs.existsSync(fp)) {
      imageUrlCache.set(url, existingLocal);
      return existingLocal;
    }
  }

  if (SKIP_IMAGES || DRY_RUN) {
    const fake = `dry-run-${crypto.randomUUID()}.webp`;
    imageUrlCache.set(url, fake);
    return fake;
  }

  try {
    const res = await fetch(url, {
      headers: { Accept: "image/*,*/*" },
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) {
      console.warn(`  ⚠️ фото HTTP ${res.status}: ${url.slice(0, 80)}`);
      return null;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const newName = `${crypto.randomUUID()}.webp`;
    await mkdir(UPLOAD_DIR, { recursive: true });
    await sharp(buffer).rotate().webp({ quality: 80 }).toFile(path.join(UPLOAD_DIR, newName));

    imageUrlCache.set(url, newName);
    return newName;
  } catch (err) {
    console.warn(`  ⚠️ фото не завантажено: ${url.slice(0, 80)}`, err);
    return null;
  }
}

async function collectProductImages(product: KeycrmProductListItem): Promise<string[]> {
  const urls = new Set<string>();
  if (product.thumbnail_url) urls.add(product.thumbnail_url);
  for (const u of product.attachments_data ?? []) {
    if (u?.trim()) urls.add(u.trim());
  }

  const filenames: string[] = [];
  const seenFiles = new Set<string>();
  for (const url of urls) {
    const name = await downloadImageAsWebp(url);
    if (name && !seenFiles.has(name)) {
      seenFiles.add(name);
      filenames.push(name);
    }
    await sleep(150);
  }
  return filenames;
}

// ─── Варіанти / розміри ──────────────────────────────────────────────────────

const SIZE_PROP_NAMES = new Set(["розмір", "size", "размер"]);
const COLOR_PROP_NAMES = COLOR_PROP_NAMES_IMPORTED;

interface ProductGroup {
  key: string;
  baseName: string;
  members: KeycrmProductListItem[];
}

/** KeyCRM часто зберігає кожен розмір/колір окремим товаром — збираємо в групи. */
function buildProductGroups(products: KeycrmProductListItem[]): ProductGroup[] {
  const byKey = new Map<string, KeycrmProductListItem[]>();

  for (const p of products) {
    if (SKIP_ARCHIVED && p.is_archived) continue;
    const key = productGroupKey(p.name);
    const list = byKey.get(key) ?? [];
    list.push(p);
    byKey.set(key, list);
  }

  const groups: ProductGroup[] = [];
  for (const [key, members] of byKey) {
    members.sort((a, b) => a.id - b.id);
    groups.push({
      key,
      baseName: modelNameFromKeycrmName(members[0]!.name),
      members,
    });
  }

  groups.sort(
    (a, b) =>
      Math.min(...a.members.map((m) => m.id)) -
      Math.min(...b.members.map((m) => m.id))
  );
  return groups;
}

const SIZE_SORT_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

function sizeSortRank(label: string): number {
  const u = label.trim().toUpperCase();
  const i = SIZE_SORT_ORDER.indexOf(u);
  if (i >= 0) return i;
  const n = Number.parseInt(u, 10);
  if (!Number.isNaN(n)) return 50 + n;
  return 100 + u.charCodeAt(0);
}

function sortSizes(rows: SizeRow[]): SizeRow[] {
  return [...rows].sort((a, b) => sizeSortRank(a.size) - sizeSortRank(b.size));
}

type SizeRow = { size: string; stock: number; keycrmOfferId: number };

/** Прибирає «порожні» варіанти KeyCRM (price=0, без SKU і без розміру у properties). */
function filterOffersForImport(
  product: KeycrmProductListItem,
  offers: KeycrmOffer[]
): KeycrmOffer[] {
  const active = offers.filter((o) => !o.is_archived);
  const list = active.length ? active : offers;
  if (list.length <= 1) return list;

  const filtered = list.filter((o) => {
    if (propValue(o.properties, SIZE_PROP_NAMES)) return true;
    if (o.sku?.trim()) return true;
    if (o.price != null && o.price > 0) return true;
    return false;
  });

  return filtered.length ? filtered : list;
}

/** Якщо кілька offers дали один розмір — зливаємо залишки, лишаємо offer з SKU/ціною. */
function dedupeSizes(rows: SizeRow[]): SizeRow[] {
  const bySize = new Map<string, SizeRow>();
  for (const row of rows) {
    const key = row.size.trim();
    if (!key) continue;
    const prev = bySize.get(key);
    if (!prev) {
      bySize.set(key, { ...row });
      continue;
    }
    prev.stock += row.stock;
    const prevScore =
      (prev.keycrmOfferId > 0 ? 2 : 0) + (prev.stock > 0 ? 1 : 0);
    const rowScore =
      (row.keycrmOfferId > 0 ? 2 : 0) + (row.stock > 0 ? 1 : 0);
    if (rowScore > prevScore) {
      prev.keycrmOfferId = row.keycrmOfferId;
    }
  }
  return [...bySize.values()];
}

function variantPropertyName(
  offers: KeycrmOffer[]
): string {
  for (const o of offers) {
    const first = o.properties?.[0];
    if (first?.name?.trim()) return first.name.trim();
  }
  return "Розмір";
}

function buildSizesFromOffers(
  product: KeycrmProductListItem,
  offers: KeycrmOffer[]
): SizeRow[] {
  const list = filterOffersForImport(product, offers);

  if (list.length === 0) {
    const reserved = product.in_reserve ?? 0;
    const stock = Math.max(0, (product.quantity ?? 0) - reserved);
    const fromName = sizeFromName(product.name);
    return [{ size: fromName ?? "OS", stock, keycrmOfferId: 0 }];
  }

  const rows = list.map((o) => {
    const reserved = o.in_reserve ?? 0;
    const stock = Math.max(0, o.quantity - reserved);
    const size =
      sizeFromName(product.name) ??
      propValue(o.properties, SIZE_PROP_NAMES) ??
      sizeFromSku(o.sku) ??
      "OS";
    return { size, stock, keycrmOfferId: o.id };
  });

  return dedupeSizes(rows);
}

function collectColors(
  offers: KeycrmOffer[]
): { label: string; hex: string | null }[] {
  const seen = new Set<string>();
  const out: { label: string; hex: string | null }[] = [];
  for (const o of offers) {
    const color = propValue(o.properties, COLOR_PROP_NAMES);
    if (!color) continue;
    const key = color.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ label: color, hex: null });
  }
  return out;
}

function resolvePrice(product: KeycrmProductListItem, offers: KeycrmOffer[]): number {
  const usable = filterOffersForImport(product, offers);
  if (usable.length > 0) {
    const prices = usable
      .map((o) => o.price)
      .filter((p): p is number => p != null && !Number.isNaN(p) && p > 0);
    if (prices.length) return Math.min(...prices);
  }
  return product.min_price ?? product.max_price ?? 0;
}

function resolveWholesalePrice(
  detail: KeycrmProductDetail | null,
  product: KeycrmProductListItem,
  offers: KeycrmOffer[]
): number | null {
  if (detail?.purchased_price != null && detail.purchased_price > 0) {
    return detail.purchased_price;
  }
  const usable = filterOffersForImport(product, offers);
  const fromOffer = usable.find(
    (o) => o.purchased_price != null && o.purchased_price > 0
  )?.purchased_price;
  return fromOffer ?? null;
}

function collectColorsFromGroupMembers(
  members: KeycrmProductListItem[],
  modelName: string
): { label: string; hex: string | null }[] {
  const seen = new Set<string>();
  const out: { label: string; hex: string | null }[] = [];
  for (const m of members) {
    const parsed = colorFromProductName(m.name, modelName);
    if (parsed) {
      const key = parsed.label.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(parsed);
      continue;
    }
    const label = variantLabelFromName(m.name, modelName);
    if (!label) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ label, hex: null });
  }
  return out;
}

function buildSizesFromProductGroup(
  members: KeycrmProductListItem[],
  offersByProduct: Map<number, KeycrmOffer[]>
): SizeRow[] {
  const rows: SizeRow[] = [];

  for (const product of members) {
    const namedSize = sizeFromName(product.name);
    if (!namedSize) continue;

    const offers = offersByProduct.get(product.id) ?? [];
    const fromOffers = buildSizesFromOffers(product, offers);
    const match =
      fromOffers.find(
        (s) => s.size.toUpperCase() === namedSize.toUpperCase()
      ) ?? fromOffers[0];

    rows.push({
      size: namedSize,
      stock: match?.stock ?? 0,
      keycrmOfferId: match?.keycrmOfferId ?? 0,
    });
  }

  if (rows.length === 0) {
    for (const product of members) {
      rows.push(...buildSizesFromOffers(product, offersByProduct.get(product.id) ?? []));
    }
  }

  return sortSizes(dedupeSizes(rows));
}

function resolveGroupPrice(
  members: KeycrmProductListItem[],
  offersByProduct: Map<number, KeycrmOffer[]>
): number {
  const prices: number[] = [];
  for (const product of members) {
    const offers = offersByProduct.get(product.id) ?? [];
    const p = resolvePrice(product, offers);
    if (p > 0) prices.push(p);
  }
  if (prices.length) return Math.min(...prices);
  for (const product of members) {
    const fallback = product.min_price ?? product.max_price;
    if (fallback != null && fallback > 0) prices.push(fallback);
  }
  return prices.length ? Math.min(...prices) : 0;
}

async function collectGroupImages(
  members: KeycrmProductListItem[]
): Promise<string[]> {
  const filenames: string[] = [];
  const seen = new Set<string>();
  for (const product of members) {
    const files = await collectProductImages(product);
    for (const f of files) {
      if (!seen.has(f)) {
        seen.add(f);
        filenames.push(f);
      }
    }
  }
  return filenames;
}

// ─── Імпорт групи товарів ────────────────────────────────────────────────────

async function upsertProductGroup(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prisma: any,
  group: ProductGroup,
  offersByProduct: Map<number, KeycrmOffer[]>,
  categoryCtx: CategoryContext
): Promise<"created" | "updated" | "skipped"> {
  const { members, baseName } = group;
  if (!members.length) return "skipped";

  const memberIds = members.map((m) => m.id);
  const canonicalKeycrmId = Math.min(...memberIds);

  const sizes = buildSizesFromProductGroup(members, offersByProduct);
  const imageFiles = await collectGroupImages(members);
  const price = resolveGroupPrice(members, offersByProduct);

  const rep =
    members.find((m) => m.description?.trim()) ??
    members.find((m) => m.category_id != null) ??
    members[0]!;

  const repOffers = offersByProduct.get(rep.id) ?? [];
  const wholesale = resolveWholesalePrice(null, rep, repOffers);

  const categoryRef = resolveCategoryForGroup(members, baseName, categoryCtx);

  const allOffers = members.flatMap((m) => offersByProduct.get(m.id) ?? []);
  const usableOffers = filterOffersForImport(rep, allOffers);
  const nameColors = collectColorsFromGroupMembers(members, baseName);
  const offerColors = collectColors(allOffers);
  const colorMap = new Map<string, { label: string; hex: string | null }>();
  for (const c of [...nameColors, ...offerColors]) {
    colorMap.set(c.label.toLowerCase(), c);
  }
  const colors = [...colorMap.values()];
  const primaryColor = colors[0] ?? null;
  const variantGroupKey = variantGroupKeyFromName(baseName);

  const variantName =
    colors.length > 1
      ? "Колір"
      : members.length > 1 && members.some((m) => sizeFromName(m.name))
        ? "Розмір"
        : variantPropertyName(usableOffers);

  const productData = {
    name: baseName,
    description: rep.description ?? null,
    price,
    wholesalePrice: wholesale,
    unitType: rep.unit_type?.trim() || "шт",
    currencyCode: (rep.currency_code || "UAH").toUpperCase(),
    weightKg: rep.weight ?? null,
    lengthCm: rep.length ?? null,
    widthCm: rep.width ?? null,
    heightCm: rep.height ?? null,
    hasMultipleVariants: sizes.length > 1 || colors.length > 1,
    variantPropertyName: variantName,
    categoryId: categoryRef?.categoryId ?? null,
    subcategoryId: categoryRef?.subcategoryId ?? null,
    color: primaryColor?.label ?? null,
    variantGroupKey: variantGroupKey || null,
    keycrmProductId: canonicalKeycrmId,
  };

  const sizeLabels = sizes.map((s) => s.size).join(", ");
  const memberLabel = memberIds.map((id) => `#${id}`).join(", ");

  if (DRY_RUN) {
    console.log(
      `  [dry-run] ${memberLabel} → "${baseName}" | ${sizes.length} розм. (${sizeLabels}) | ${imageFiles.length} фото`
    );
    return "created";
  }

  const existingMatches = await prisma.product.findMany({
    where: {
      OR: [{ keycrmProductId: { in: memberIds } }, { name: baseName }],
    },
    orderBy: { id: "asc" },
  });
  const keeper = existingMatches[0] ?? null;

  // Зняти keycrm_product_id з усіх варіантів групи, щоб не було unique conflict
  await prisma.product.updateMany({
    where: { keycrmProductId: { in: memberIds } },
    data: { keycrmProductId: null },
  });

  const duplicateLocalIds = existingMatches.slice(1).map((m: { id: number }) => m.id);
  if (duplicateLocalIds.length) {
    await prisma.product.deleteMany({
      where: { id: { in: duplicateLocalIds } },
    });
  }

  let localId: number;

  if (keeper) {
    await prisma.product.update({
      where: { id: keeper.id },
      data: productData,
    });
    localId = keeper.id;

    await prisma.productSize.deleteMany({ where: { productId: localId } });
    await prisma.productMedia.deleteMany({ where: { productId: localId } });
    await prisma.productColor.deleteMany({ where: { productId: localId } });
  } else {
    const created = await prisma.product.create({ data: productData });
    localId = created.id;
  }

  if (sizes.length) {
    await prisma.productSize.createMany({
      data: sizes.map((s) => ({
        productId: localId,
        size: s.size,
        stock: s.stock,
        keycrmOfferId: s.keycrmOfferId > 0 ? s.keycrmOfferId : null,
      })),
    });
  }

  if (imageFiles.length) {
    await prisma.productMedia.createMany({
      data: imageFiles.map((filename) => ({
        productId: localId,
        type: "photo",
        url: filename,
      })),
    });
  }

  if (colors.length) {
    await prisma.productColor.createMany({
      data: colors.map((c) => ({
        productId: localId,
        label: c.label,
        hex: c.hex,
      })),
    });
  }

  return keeper ? "updated" : "created";
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("🚀 Імпорт каталогу KeyCRM → сайт\n");
  if (DRY_RUN) console.log("⚠️  Режим --dry-run (без запису в БД)\n");
  if (SKIP_IMAGES) console.log("⚠️  --skip-images\n");

  if (!process.env.DATABASE_URL && !DRY_RUN) {
    throw new Error("DATABASE_URL is not set");
  }
  getKeycrmApiKey();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let pool: any = null;

  if (!DRY_RUN) {
    /* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
    const { PrismaClient } = require("@prisma/client") as any;
    const { PrismaPg } = require("@prisma/adapter-pg");
    const { Pool } = require("pg");
    /* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes("sslmode=require")
        ? { rejectUnauthorized: false }
        : false,
    });
    prisma = new PrismaClient({
      adapter: new PrismaPg(pool),
      log: ["error"],
    });
  }

  const start = Date.now();
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  try {
    const keycrmCategories = await fetchAllPaginated<KeycrmCategory>(
      "Категорії KeyCRM",
      (page) => `/products/categories?limit=${PAGE_LIMIT}&page=${page}`
    );

    const categoryMapping = await syncCategories(
      prisma ?? { category: { findFirst: async () => null, create: async () => ({}) }, subcategory: { findFirst: async () => null, create: async () => ({}) } },
      keycrmCategories
    );
    const categoryCtx = createCategoryContext(keycrmCategories, categoryMapping);

    const products = await fetchAllPaginated<KeycrmProductListItem>(
      "Товари KeyCRM",
      (page) => `/products?limit=${PAGE_LIMIT}&page=${page}`
    );

    if (SINGLE_PRODUCT_ID != null && !Number.isNaN(SINGLE_PRODUCT_ID)) {
      console.log(`\n📦 Фільтр групи для KeyCRM #${SINGLE_PRODUCT_ID}`);
    }

    const allOffers = await fetchAllPaginated<KeycrmOffer>(
      "Варіанти (offers) KeyCRM",
      (page) => `/offers?limit=${PAGE_LIMIT}&page=${page}`
    );

    const offersByProduct = new Map<number, KeycrmOffer[]>();
    for (const o of allOffers) {
      const list = offersByProduct.get(o.product_id) ?? [];
      list.push(o);
      offersByProduct.set(o.product_id, list);
    }

    let groups = buildProductGroups(products);

    if (SINGLE_PRODUCT_ID != null && !Number.isNaN(SINGLE_PRODUCT_ID)) {
      groups = groups.filter((g) =>
        g.members.some((m) => m.id === SINGLE_PRODUCT_ID)
      );
      if (!groups.length) {
        console.warn(`⚠️  Товар #${SINGLE_PRODUCT_ID} не знайдено`);
      }
    }

    if (
      IMPORT_LIMIT != null &&
      !Number.isNaN(IMPORT_LIMIT) &&
      IMPORT_LIMIT > 0
    ) {
      groups = groups.slice(0, IMPORT_LIMIT);
      console.log(`\n📌 Ліміт: перші ${IMPORT_LIMIT} груп`);
    }

    if (RESET_CATALOG && !DRY_RUN && prisma) {
      if (
        IMPORT_LIMIT == null &&
        SINGLE_PRODUCT_ID == null &&
        !args.includes("--force-reset")
      ) {
        throw new Error(
          "Для --reset-catalog додайте --limit=N або --product-id=… (або --force-reset)"
        );
      }
      console.log("\n🗑️  Очищення каталогу в БД...");
      await prisma.product.deleteMany({});
      console.log("✅ Каталог очищено");
    }

    const mergedCount = groups.filter((g) => g.members.length > 1).length;
    console.log(
      `\n🔄 Імпорт: ${products.length} поз. KeyCRM → ${groups.length} товарів на сайті (${mergedCount} обʼєднаних груп)\n`
    );

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i]!;

      try {
        const result = await upsertProductGroup(
          prisma ?? {},
          group,
          offersByProduct,
          categoryCtx
        );
        if (result === "created") created++;
        else if (result === "updated") updated++;
        else skipped++;

        const mark =
          result === "created" ? "✅" : result === "updated" ? "🔄" : "⏭️";
        const sizes = buildSizesFromProductGroup(group.members, offersByProduct);
        const sizeInfo = sizes.map((s) => s.size).join(", ");
        console.log(
          `${mark} [${i + 1}/${groups.length}] "${group.baseName}" ← ${group.members.length} поз. KeyCRM | розміри: ${sizeInfo}`
        );
      } catch (err) {
        errors++;
        console.error(`❌ "${group.baseName}":`, err);
      }

      if ((i + 1) % 5 === 0) await sleep(REQUEST_DELAY_MS);
    }

    console.log("\n📊 Підсумок:");
    console.log(`   Створено:  ${created}`);
    console.log(`   Оновлено:  ${updated}`);
    console.log(`   Пропущено: ${skipped}`);
    console.log(`   Помилок:   ${errors}`);
    console.log(`   Час:       ${((Date.now() - start) / 1000).toFixed(1)}с`);

    if (!DRY_RUN && prisma) {
      const total = await prisma.product.count();
      console.log(`\n📦 Товарів у БД зараз: ${total}`);
      console.log(`   DATABASE_URL → ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":***@")}`);

      const cacheDir = path.join(process.cwd(), ".next", "cache");
      if (fs.existsSync(cacheDir)) {
        fs.rmSync(cacheDir, { recursive: true, force: true });
        console.log("🧹 Кеш Next.js очищено — перезапустіть npm run dev");
      }
    }
  } finally {
    if (prisma) await prisma.$disconnect();
    if (pool) await pool.end();
  }
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
