#!/usr/bin/env ts-node

/**
 * Скрипт для тестового додавання категорій товарів (wellness/Choice).
 * Запуск: npm run seed-test-categories
 *
 * Додає категорії: Фітокомплекси та вітаміни, Корекція ваги, Догляд за тілом, Есо-засоби для дому.
 * Slug генерується автоматично з назви. Медіа не додаються — на головній буде сірий placeholder.
 */

import fs from "node:fs";
import path from "node:path";

function loadEnvUrl(): void {
  const envPath = path.join(process.cwd(), ".env");
  if (!process.env.DATABASE_URL && fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    const match = content.match(/DATABASE_URL=(.*)/);
    if (match) {
      process.env.DATABASE_URL = match[1].replace(/['"]/g, "").trim();
    }
  }
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL не задано. Перевірте .env");
    process.exit(1);
  }
}

const TEST_CATEGORIES = [
  { name: "Фітокомплекси та вітаміни", priority: 10 },
  { name: "Корекція ваги", priority: 9 },
  { name: "Догляд за тілом", priority: 8 },
  { name: "Есо-засоби для дому", priority: 7 },
];

async function main() {
  loadEnvUrl();

  const { prisma } = await import("../lib/prisma");
  const { sqlPostCategory } = await import("../lib/sql");

  console.log("🚀 Додавання тестових категорій...\n");

  const existing = await prisma.category.findMany({ select: { name: true } });
  const existingNames = new Set(existing.map((c) => c.name.trim().toLowerCase()));

  for (const { name, priority } of TEST_CATEGORIES) {
    if (existingNames.has(name.trim().toLowerCase())) {
      console.log(`⏭️  Категорія "${name}" вже існує, пропуск.\n`);
      continue;
    }
    const category = await sqlPostCategory(name, priority);
    console.log(`✅ Додано: ${category.name} (slug: ${category.slug})\n`);
  }

  console.log("🎉 Готово.");
}

main().catch((err) => {
  console.error("❌ Помилка:", err);
  process.exit(1);
});
