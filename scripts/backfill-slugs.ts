#!/usr/bin/env ts-node

/**
 * Заповнює slug для існуючих категорій та товарів (транслітерація UA → EN).
 * Запуск після міграції add_slugs: npm run backfill-slugs
 */

import fs from "node:fs";
import path from "node:path";

function loadEnvUrl(): string {
  const envPath = path.join(process.cwd(), ".env");
  if (!process.env.DATABASE_URL && fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    const match = content.match(/DATABASE_URL=(.*)/);
    if (match) {
      process.env.DATABASE_URL = match[1].replace(/['"]/g, "");
    }
  }
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set.");
    process.exit(1);
  }
  return process.env.DATABASE_URL;
}

loadEnvUrl();

import { PrismaClient } from "@prisma/client";
import { textToSlug } from "../lib/slug";

const prisma = new PrismaClient();

function ensureUnique(baseSlug: string, used: Set<string>): string {
  let slug = baseSlug;
  let n = 2;
  while (used.has(slug)) {
    slug = `${baseSlug}-${n}`;
    n += 1;
  }
  used.add(slug);
  return slug;
}

async function main() {
  console.log("Backfill slugs for categories and products...\n");

  const usedCategorySlugs = new Set<string>();
  const categories = await prisma.category.findMany({ select: { id: true, name: true, slug: true } });
  for (const cat of categories) {
    const base = textToSlug(cat.name);
    const slug = ensureUnique(base, usedCategorySlugs);
    await prisma.category.update({ where: { id: cat.id }, data: { slug } });
    console.log(`  Category ${cat.id} "${cat.name}" → ${slug}`);
  }
  console.log(`\nUpdated ${categories.length} categories.`);

  const usedProductSlugs = new Set<string>();
  const products = await prisma.product.findMany({ select: { id: true, name: true } });
  for (const p of products) {
    const base = textToSlug(p.name);
    const slug = ensureUnique(base, usedProductSlugs);
    await prisma.product.update({ where: { id: p.id }, data: { slug } });
    console.log(`  Product ${p.id} "${p.name}" → ${slug}`);
  }
  console.log(`\nUpdated ${products.length} products.`);
  console.log("\nDone.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
