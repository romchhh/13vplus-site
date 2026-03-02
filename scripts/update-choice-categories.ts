#!/usr/bin/env ts-node

/**
 * Оновлює структуру каталогу під Choice:
 * створює / оновлює категорії та підкатегорії згідно з фінальним ТЗ.
 *
 * Запуск (з кореня проєкту):
 *   npx ts-node scripts/update-choice-categories.ts
 * або (якщо додасте npm-скрипт) :
 *   npm run update-choice-categories
 */

import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

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

// Явно передаємо порожні опції, щоб уникнути помилки ініціалізації клієнта
const prisma = new PrismaClient({});

function toSlug(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "category"
  );
}

type CatalogStructure = {
  name: string;
  priority: number;
  subcategories: string[];
};

const STRUCTURE: CatalogStructure[] = [
  {
    name: "Очищення і детокс",
    priority: 1,
    subcategories: [
      "детокс",
      "антипаразитарний захист",
      "протигрибковий захист",
      "очищення кишечника",
      "очищення лімфи",
      "підтримка печінки",
      "травлення",
    ],
  },
  {
    name: "Імунітет і відновлення",
    priority: 2,
    subcategories: [
      "імунітет",
      "антиоксидантний захист",
      "відновлення організму",
      "підтримка після стресу або навантаження",
    ],
  },
  {
    name: "Енергія, мозок і щоденна підтримка",
    priority: 3,
    subcategories: [
      "енергія",
      "антистрес",
      "пам’ять і увага",
      "обмін речовин",
      "базові вітаміни",
    ],
  },
  {
    name: "Контроль ваги і метаболізм",
    priority: 4,
    subcategories: [
      "програми корекції ваги",
      "контроль ваги",
      "підтримка метаболізму",
      "детокс для зниження ваги",
    ],
  },
  {
    name: "Дитяче здоров’я",
    priority: 5,
    subcategories: [
      "всі продукти для дітей",
    ],
  },
  {
    name: "Набори і програми",
    priority: 6,
    subcategories: [
      "антипаразитарна програма",
      "detox програми",
      "wellness набори",
      "комплексні курси",
    ],
  },
];

async function ensureCategoryWithSubcategories(struct: CatalogStructure) {
  const baseSlug = toSlug(struct.name);

  // Категорія: шукаємо по name, далі оновлюємо по id або створюємо нову
  const existingByName = await prisma.category.findFirst({
    where: { name: struct.name },
  });

  let category;

  if (existingByName) {
    category = await prisma.category.update({
      where: { id: existingByName.id },
      data: {
        slug: baseSlug,
        priority: struct.priority,
      },
    });
  } else {
    category = await prisma.category.create({
      data: {
        name: struct.name,
        slug: baseSlug,
        priority: struct.priority,
      },
    });
  }

  console.log(`✅ Категорія: ${category.name} (id=${category.id}, slug=${category.slug})`);

  // Підкатегорії: шукаємо по name + categoryId, щоб не створювати дублікати
  for (const subName of struct.subcategories) {
    const subSlug = toSlug(subName);

    const existing = await prisma.subcategory.findFirst({
      where: {
        name: subName,
        categoryId: category.id,
      },
    });

    if (existing) {
      await prisma.subcategory.update({
        where: { id: existing.id },
        data: { slug: subSlug },
      });
      console.log(`  • Оновлено підкатегорію: "${subName}" (id=${existing.id}, slug=${subSlug})`);
    } else {
      const created = await prisma.subcategory.create({
        data: {
          name: subName,
          slug: subSlug,
          categoryId: category.id,
        },
      });
      console.log(`  • Створено підкатегорію: "${created.name}" (id=${created.id}, slug=${created.slug})`);
    }
  }
}

async function main() {
  console.log("=== Оновлення структури каталогу Choice (категорії + підкатегорії) ===\n");

  const existingCategories = await prisma.category.findMany({
    include: { subcategories: true },
    orderBy: { priority: "asc" },
  });

  console.log(`Поточні категорії в базі: ${existingCategories.length}`);
  for (const cat of existingCategories) {
    console.log(
      ` - [${cat.id}] ${cat.name} (slug=${cat.slug ?? "—"}) підкатегорій: ${cat.subcategories.length}`,
    );
  }
  console.log("\nСтворюємо / оновлюємо категорії згідно з новою структурою...\n");

  for (const struct of STRUCTURE) {
    await ensureCategoryWithSubcategories(struct);
    console.log("");
  }

  console.log("🎯 Готово. Перевірте результат в адмінці (категорії та підкатегорії).");
  console.log("⚠️ Зверніть увагу: існуючі продукти НЕ переназначаються в нові категорії цим скриптом.");
}

main()
  .catch((e) => {
    console.error("❌ Помилка під час оновлення структури каталогу:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

