#!/usr/bin/env ts-node

/**
 * Script to add categories and subcategories to the database
 * Run with: npm run add-categories
 */

import fs from "node:fs";
import path from "node:path";

// Load environment variables from .env file
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
    console.error("❌ DATABASE_URL is not set. Please check your .env file.");
    process.exit(1);
  }
  return process.env.DATABASE_URL;
}

// Load DATABASE_URL before importing prisma
loadEnvUrl();

import { prisma } from "../lib/prisma";
import { sqlPostCategory, sqlPostSubcategory } from "../lib/sql";

// Фінальна структура каталогу Choice / wellness
const categoriesData = [
  {
    name: "Очищення і детокс",
    priority: 10,
    subcategories: [
      "Детокс",
      "Антипаразитарний захист",
      "Протигрибковий захист",
      "Очищення кишечника",
      "Очищення лімфи",
      "Підтримка печінки",
      "Травлення",
    ],
  },
  {
    name: "Імунітет і відновлення",
    priority: 9,
    subcategories: [
      "Імунітет",
      "Антиоксидантний захист",
      "Відновлення організму",
      "Підтримка після стресу або навантаження",
    ],
  },
  {
    name: "Енергія, мозок і щоденна підтримка",
    priority: 8,
    subcategories: [
      "Енергія",
      "Антистрес",
      "Пам'ять і увага",
      "Обмін речовин",
      "Базові вітаміни",
    ],
  },
  {
    name: "Контроль ваги і метаболізм",
    priority: 7,
    subcategories: [
      "Програми корекції ваги",
      "Контроль ваги",
      "Підтримка метаболізму",
      "Детокс для зниження ваги",
    ],
  },
  {
    name: "Дитяче здоров'я",
    priority: 6,
    subcategories: [
      "Вітаміни для дітей",
      "Антипаразитарні програми для дітей",
      "Дитячі комплекси",
    ],
  },
  {
    name: "Набори і програми",
    priority: 5,
    subcategories: [
      "Антипаразитарна програма",
      "Detox програми",
      "Wellness набори",
      "Комплексні курси",
    ],
  },
];

async function main() {
  console.log("🚀 Starting to add categories and subcategories...\n");

  try {
    // Get existing categories to avoid duplicates (use Prisma directly — sqlGetAllCategories uses Next.js unstable_cache and fails in scripts)
    const existingCategories = await prisma.category.findMany({
      select: { name: true },
    });
    const existingCategoryNames = new Set(
      existingCategories.map((cat) => cat.name.toUpperCase())
    );

    for (const categoryData of categoriesData) {
      const categoryNameUpper = categoryData.name.toUpperCase();
      
      // Check if category already exists
      if (existingCategoryNames.has(categoryNameUpper)) {
        console.log(`⏭️  Category "${categoryData.name}" already exists, skipping...`);
        continue;
      }

      // Create category
      console.log(`📁 Creating category: ${categoryData.name}`);
      const category = await sqlPostCategory(
        categoryData.name,
        categoryData.priority
      );

      // Create subcategories
      if (categoryData.subcategories.length > 0) {
        console.log(`   Creating ${categoryData.subcategories.length} subcategories...`);
        for (const subcategoryName of categoryData.subcategories) {
          await sqlPostSubcategory(subcategoryName, category.id);
          console.log(`   ✓ ${subcategoryName}`);
        }
      }

      console.log(`✅ Category "${categoryData.name}" created successfully!\n`);
    }

    console.log("🎉 All categories and subcategories added successfully!");
  } catch (error) {
    console.error("❌ Error adding categories:", error);
    process.exit(1);
  }
}

main();

