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

import { sqlPostCategory, sqlPostSubcategory, sqlGetAllCategories } from "../lib/sql";

// Categories and subcategories data
const categoriesData = [
  {
    name: "КОЛЕКЦІЇ",
    priority: 10,
    subcategories: [],
  },
  {
    name: "ВЕРХНІЙ ОДЯГ",
    priority: 9,
    subcategories: ["Пальта", "Жакети", "Пуховики", "Екошуби", "Куртки"],
  },
  {
    name: "СУКНІ",
    priority: 8,
    subcategories: [],
  },
  {
    name: "СПІДНИЦІ",
    priority: 7,
    subcategories: [],
  },
  {
    name: "ВЕРХИ",
    priority: 6,
    subcategories: [
      "Жакети",
      "Жилети",
      "Светри",
      "Худі",
      "Світшоти",
      "Лонгсліви",
      "Сорочки",
      "Футболки",
      "Майки",
      "Корсети",
      "Топи",
    ],
  },
  {
    name: "ШТАНИ ТА ШОРТИ",
    priority: 5,
    subcategories: ["Джинси", "Лосини", "Шорти", "Штани"],
  },
  {
    name: "ПЛЯЖНИЙ ОДЯГ",
    priority: 4,
    subcategories: ["Купальники", "Туніки"],
  },
  {
    name: "ДОМАШНІЙ ОДЯГ",
    priority: 3,
    subcategories: [
      "Піжами (жіночі / чоловічі)",
      "Халати (жіночі / чоловічі)",
    ],
  },
];

async function main() {
  console.log("🚀 Starting to add categories and subcategories...\n");

  try {
    // Get existing categories to avoid duplicates
    const existingCategories = await sqlGetAllCategories();
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

