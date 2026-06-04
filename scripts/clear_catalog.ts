/**
 * Видалення всіх товарів і категорій з локальної БД.
 *
 * Змінні середовища (.env):
 *   DATABASE_URL — PostgreSQL
 *
 * Опції:
 *   --yes          — підтвердити видалення (обовʼязково)
 *   --wipe-images  — також видалити файли з product-images/
 *
 * Запуск:
 *   npm run clear-catalog -- --yes
 *   npm run clear-catalog -- --yes --wipe-images
 */

import fs from "node:fs";
import path from "node:path";
import { readdir, unlink } from "node:fs/promises";

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

const args = process.argv.slice(2);
const CONFIRMED = args.includes("--yes");
const WIPE_IMAGES = args.includes("--wipe-images");

async function wipeProductImagesDir(): Promise<number> {
  const dir = path.join(process.cwd(), "product-images");
  if (!fs.existsSync(dir)) return 0;

  const entries = await readdir(dir);
  let removed = 0;
  for (const name of entries) {
    if (name === ".gitkeep") continue;
    await unlink(path.join(dir, name)).catch(() => {});
    removed++;
  }
  return removed;
}

async function main(): Promise<void> {
  if (!CONFIRMED) {
    console.error(
      "⚠️  Небезпечна операція. Додайте --yes для підтвердження:\n" +
        "   npm run clear-catalog -- --yes"
    );
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
  }

  /* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
  const { PrismaClient } = require("@prisma/client") as any;
  const { PrismaPg } = require("@prisma/adapter-pg");
  const { Pool } = require("pg");
  /* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */

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
    const [productsBefore, categoriesBefore, subcategoriesBefore] =
      await Promise.all([
        prisma.product.count(),
        prisma.category.count(),
        prisma.subcategory.count(),
      ]);

    console.log("🗑️  Очищення каталогу...\n");
    console.log(`   Товарів:      ${productsBefore}`);
    console.log(`   Категорій:    ${categoriesBefore}`);
    console.log(`   Підкатегорій: ${subcategoriesBefore}`);
    console.log(
      `   БД: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":***@")}\n`
    );

    const deletedProducts = await prisma.product.deleteMany({});
    const deletedCategories = await prisma.category.deleteMany({});

    console.log(`✅ Видалено товарів:      ${deletedProducts.count}`);
    console.log(`✅ Видалено категорій:    ${deletedCategories.count}`);
    console.log(
      "   (підкатегорії, розміри, фото та кольори товарів — каскадом)"
    );

    if (WIPE_IMAGES) {
      const filesRemoved = await wipeProductImagesDir();
      console.log(`✅ Файлів у product-images/: ${filesRemoved}`);
    }

    const cacheDir = path.join(process.cwd(), ".next", "cache");
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true, force: true });
      console.log("🧹 Кеш Next.js очищено — перезапустіть npm run dev");
    }

    console.log("\n🎉 Каталог очищено");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
