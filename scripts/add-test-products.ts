#!/usr/bin/env ts-node

/**
 * Script to add test products to the database
 * Run with: npm run add-test-products
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

import { sqlPostProduct, sqlGetAllCategories } from "../lib/sql";

// Color palette with hex values
const colorPalette: Record<string, string> = {
  Чорний: "#000000",
  Білий: "#FFFFFF",
  Сірий: "#808080",
  "Темно-сірий": "#4B4B4B",
  Бежевий: "#F5F5DC",
  Коричневий: "#8B4513",
  Червоний: "#FF0000",
  Рожевий: "#FFC0CB",
  Блакитний: "#87CEEB",
  Зелений: "#008000",
};

// Test products data
const testProducts = [
  {
    name: "Шовкова сорочка без рукавів",
    description: "Елегантна шовкова сорочка без рукавів у мінімалістичному стилі. Ідеально підходить для повсякденного носіння та особливих випадків.",
    price: 1780,
    old_price: null,
    discount_percentage: null,
    top_sale: false,
    limited_edition: true,
    season: ["Весна", "Літо"],
    color: "Чорний",
    fabric_composition: "100% шовк",
    has_lining: false,
    sizes: [
      { size: "XS", stock: 5 },
      { size: "S", stock: 8 },
      { size: "M", stock: 10 },
      { size: "L", stock: 6 },
      { size: "XL", stock: 3 },
    ],
    colors: [
      { label: "Чорний", hex: colorPalette["Чорний"] },
      { label: "Білий", hex: colorPalette["Білий"] },
      { label: "Бежевий", hex: colorPalette["Бежевий"] },
    ],
  },
  {
    name: "Класичні джинси прямого крою",
    description: "Універсальні джинси прямого крою з високою посадкою. Зручні та стильні для будь-якого випадку.",
    price: 2200,
    old_price: 2800,
    discount_percentage: 21,
    top_sale: true,
    limited_edition: false,
    season: ["Весна", "Літо", "Осінь", "Зима"],
    color: "Сірий",
    fabric_composition: "98% бавовна, 2% еластан",
    has_lining: false,
    sizes: [
      { size: "XS", stock: 4 },
      { size: "S", stock: 7 },
      { size: "M", stock: 12 },
      { size: "L", stock: 9 },
      { size: "XL", stock: 5 },
    ],
    colors: [
      { label: "Сірий", hex: colorPalette["Сірий"] },
      { label: "Темно-сірий", hex: colorPalette["Темно-сірий"] },
      { label: "Чорний", hex: colorPalette["Чорний"] },
    ],
  },
  {
    name: "Елегантне пальто з вовни",
    description: "Тепле та стильне пальто з натуральної вовни. Ідеально для прохолодної погоди.",
    price: 4500,
    old_price: null,
    discount_percentage: null,
    top_sale: false,
    limited_edition: false,
    season: ["Осінь", "Зима"],
    color: "Коричневий",
    fabric_composition: "80% вовна, 20% поліестер",
    has_lining: true,
    lining_description: "Шовкова підкладка",
    sizes: [
      { size: "S", stock: 3 },
      { size: "M", stock: 5 },
      { size: "L", stock: 4 },
      { size: "XL", stock: 2 },
    ],
    colors: [
      { label: "Коричневий", hex: colorPalette["Коричневий"] },
      { label: "Чорний", hex: colorPalette["Чорний"] },
      { label: "Сірий", hex: colorPalette["Сірий"] },
    ],
  },
  {
    name: "Спортивний костюм",
    description: "Зручний та стильний спортивний костюм для активного відпочинку та тренувань.",
    price: 1900,
    old_price: null,
    discount_percentage: null,
    top_sale: false,
    limited_edition: false,
    season: ["Весна", "Літо", "Осінь"],
    color: "Чорний",
    fabric_composition: "95% бавовна, 5% еластан",
    has_lining: false,
    sizes: [
      { size: "XS", stock: 6 },
      { size: "S", stock: 8 },
      { size: "M", stock: 10 },
      { size: "L", stock: 7 },
    ],
    colors: [
      { label: "Чорний", hex: colorPalette["Чорний"] },
      { label: "Сірий", hex: colorPalette["Сірий"] },
      { label: "Рожевий", hex: colorPalette["Рожевий"] },
    ],
  },
  {
    name: "Безрукавка з кардиганом",
    description: "Елегантна безрукавка з кардиганом у класичному стилі. Універсальний вибір для офісу та повсякденного носіння.",
    price: 1650,
    old_price: 2000,
    discount_percentage: 18,
    top_sale: true,
    limited_edition: false,
    season: ["Весна", "Осінь"],
    color: "Бежевий",
    fabric_composition: "70% бавовна, 30% акрил",
    has_lining: false,
    sizes: [
      { size: "XS", stock: 4 },
      { size: "S", stock: 6 },
      { size: "M", stock: 8 },
      { size: "L", stock: 5 },
      { size: "XL", stock: 3 },
    ],
    colors: [
      { label: "Бежевий", hex: colorPalette["Бежевий"] },
      { label: "Чорний", hex: colorPalette["Чорний"] },
      { label: "Сірий", hex: colorPalette["Сірий"] },
    ],
  },
  {
    name: "Купальник двобічний",
    description: "Стильний двобічний купальник для пляжу та басейну. Зручний та елегантний.",
    price: 1200,
    old_price: null,
    discount_percentage: null,
    top_sale: false,
    limited_edition: false,
    season: ["Літо"],
    color: "Чорний",
    fabric_composition: "80% поліамід, 20% еластан",
    has_lining: true,
    lining_description: "Вбудована підтримка",
    sizes: [
      { size: "XS", stock: 5 },
      { size: "S", stock: 7 },
      { size: "M", stock: 9 },
      { size: "L", stock: 6 },
    ],
    colors: [
      { label: "Чорний", hex: colorPalette["Чорний"] },
      { label: "Білий", hex: colorPalette["Білий"] },
      { label: "Рожевий", hex: colorPalette["Рожевий"] },
      { label: "Блакитний", hex: colorPalette["Блакитний"] },
    ],
  },
  {
    name: "Шапка з вовни",
    description: "Тепла та стильна шапка з натуральної вовни. Захищає від холоду та виглядає елегантно.",
    price: 850,
    old_price: null,
    discount_percentage: null,
    top_sale: false,
    limited_edition: false,
    season: ["Осінь", "Зима"],
    color: "Чорний",
    fabric_composition: "100% вовна",
    has_lining: false,
    sizes: [
      { size: "O/S", stock: 15 },
    ],
    colors: [
      { label: "Чорний", hex: colorPalette["Чорний"] },
      { label: "Сірий", hex: colorPalette["Сірий"] },
      { label: "Бежевий", hex: colorPalette["Бежевий"] },
    ],
  },
  {
    name: "Куртка джинсова",
    description: "Класична джинсова куртка з комфортним кроєм. Універсальний вибір для будь-якого сезону.",
    price: 2100,
    old_price: 2500,
    discount_percentage: 16,
    top_sale: true,
    limited_edition: false,
    season: ["Весна", "Літо", "Осінь"],
    color: "Сірий",
    fabric_composition: "98% бавовна, 2% еластан",
    has_lining: false,
    sizes: [
      { size: "XS", stock: 3 },
      { size: "S", stock: 5 },
      { size: "M", stock: 7 },
      { size: "L", stock: 4 },
      { size: "XL", stock: 2 },
    ],
    colors: [
      { label: "Сірий", hex: colorPalette["Сірий"] },
      { label: "Чорний", hex: colorPalette["Чорний"] },
      { label: "Блакитний", hex: colorPalette["Блакитний"] },
    ],
  },
  {
    name: "Майка базова",
    description: "Базова майка з якісної бавовни. Комфортна та універсальна для будь-якого гардеробу.",
    price: 450,
    old_price: null,
    discount_percentage: null,
    top_sale: false,
    limited_edition: false,
    season: ["Весна", "Літо", "Осінь"],
    color: "Білий",
    fabric_composition: "100% бавовна",
    has_lining: false,
    sizes: [
      { size: "XS", stock: 10 },
      { size: "S", stock: 15 },
      { size: "M", stock: 20 },
      { size: "L", stock: 12 },
      { size: "XL", stock: 8 },
    ],
    colors: [
      { label: "Білий", hex: colorPalette["Білий"] },
      { label: "Чорний", hex: colorPalette["Чорний"] },
      { label: "Сірий", hex: colorPalette["Сірий"] },
      { label: "Бежевий", hex: colorPalette["Бежевий"] },
    ],
  },
  {
    name: "Плащ дощовий",
    description: "Стильний дощовий плащ з водонепроникного матеріалу. Захищає від дощу та вітру.",
    price: 2800,
    old_price: null,
    discount_percentage: null,
    top_sale: false,
    limited_edition: false,
    season: ["Весна", "Осінь"],
    color: "Чорний",
    fabric_composition: "100% поліестер з водонепроникним покриттям",
    has_lining: false,
    sizes: [
      { size: "S", stock: 4 },
      { size: "M", stock: 6 },
      { size: "L", stock: 5 },
      { size: "XL", stock: 3 },
    ],
    colors: [
      { label: "Чорний", hex: colorPalette["Чорний"] },
      { label: "Бежевий", hex: colorPalette["Бежевий"] },
      { label: "Зелений", hex: colorPalette["Зелений"] },
    ],
  },
];

// Map product names to category names (approximate matching)
const categoryMapping: Record<string, string> = {
  "Шовкова сорочка": "Майки",
  "джинси": "Джинси",
  "пальто": "Пальта",
  "Спортивний": "Спортивний одяг",
  "безрукавка": "Жилетки",
  "купальник": "Майки", // or create a swimwear category
  "шапка": "Головні убори",
  "куртка": "Куртки",
  "майка": "Майки",
  "плащ": "Куртки",
};

async function main() {
  try {
    console.log("🚀 Starting to add test products...\n");

    // Get all categories
    const categories = await sqlGetAllCategories();
    console.log(`📦 Found ${categories.length} categories:`);
    categories.forEach((cat) => {
      console.log(`   - ${cat.name} (ID: ${cat.id})`);
    });
    console.log();

    // Create a map of category names to IDs
    const categoryMap = new Map<string, number>();
    categories.forEach((cat) => {
      categoryMap.set(cat.name.toLowerCase(), cat.id);
    });

    let successCount = 0;
    let errorCount = 0;

    // Add each test product
    for (const product of testProducts) {
      try {
        // Try to find matching category
        let categoryId: number | null = null;
        for (const [key, categoryName] of Object.entries(categoryMapping)) {
          if (product.name.toLowerCase().includes(key.toLowerCase())) {
            const catId = categoryMap.get(categoryName.toLowerCase());
            if (catId) {
              categoryId = catId;
              break;
            }
          }
        }

        // If no match found, try to match by first word or use first category
        if (!categoryId && categories.length > 0) {
          // Try to find a category that matches the product type
          const productFirstWord = product.name.split(" ")[0].toLowerCase();
          for (const cat of categories) {
            if (cat.name.toLowerCase().includes(productFirstWord) || 
                productFirstWord.includes(cat.name.toLowerCase())) {
              categoryId = cat.id;
              break;
            }
          }
          // If still no match, use the first category
          if (!categoryId) {
            categoryId = categories[0].id;
          }
        }

        const productData = {
          ...product,
          category_id: categoryId,
          subcategory_id: null,
          priority: 0,
        };

        const result = await sqlPostProduct(productData);
        console.log(`✅ Added: ${product.name} (ID: ${result.id})`);
        if (categoryId) {
          const categoryName = categories.find((c) => c.id === categoryId)?.name || "Unknown";
          console.log(`   Category: ${categoryName}`);
        }
        successCount++;
      } catch (error) {
        console.error(`❌ Error adding product "${product.name}":`, error);
        errorCount++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`✨ Summary:`);
    console.log(`   ✅ Successfully added: ${successCount} products`);
    console.log(`   ❌ Errors: ${errorCount} products`);
    console.log("=".repeat(50));
  } catch (error) {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  }
}

// Run the script
main()
  .then(() => {
    console.log("\n🎉 Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Script failed:", error);
    process.exit(1);
  });

