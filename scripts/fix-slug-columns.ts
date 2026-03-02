#!/usr/bin/env ts-node
/**
 * Додає колонки slug до categories, products, subcategories якщо їх немає (виправлення P2022).
 * Запуск: npm run fix-slug-columns
 */

import fs from "node:fs";
import path from "node:path";

function loadEnv(): void {
  const envPath = path.join(process.cwd(), ".env");
  if (!process.env.DATABASE_URL && fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, "");
    }
  }
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set.");
    process.exit(1);
  }
}

loadEnv();

const statements = [
  `ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "slug" TEXT`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_key" ON "categories"("slug")`,
  `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "slug" TEXT`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "products_slug_key" ON "products"("slug")`,
  `ALTER TABLE "subcategories" ADD COLUMN IF NOT EXISTS "slug" TEXT`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "subcategories_slug_key" ON "subcategories"("slug")`,
  `ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "product_name" TEXT`,
  `ALTER TABLE "order_items" ALTER COLUMN "product_id" DROP NOT NULL`,
];

async function main() {
  const { prisma } = await import("../lib/prisma");
  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log("✓", sql.slice(0, 60) + "...");
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err?.code === "42701") {
        console.log("○ Column/index already exists, skip:", sql.slice(0, 50) + "...");
      } else {
        throw e;
      }
    }
  }
  console.log("\nDone. Run: npm run backfill-slugs (to fill slugs for existing rows).");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
