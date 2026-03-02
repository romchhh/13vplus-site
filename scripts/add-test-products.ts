#!/usr/bin/env ts-node

/**
 * Script to add test products to the database
 * Run with: npm run add-test-products
 */

import fs from "node:fs";
import path from "node:path";

// Завантажити .env одразу при завантаженні скрипта (до будь-якого import prisma)
(function loadEnvSync() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("DATABASE_URL=")) {
        let value = trimmed.slice(13).trim();
        if (value.startsWith('"') || value.startsWith("'")) {
          const quote = value[0];
          const end = value.indexOf(quote, 1);
          value = end > 0 ? value.slice(1, end) : value.slice(1);
        }
        value = value.split(/\s+#\s+/)[0].trim();
        if (value) process.env.DATABASE_URL = value;
        break;
      }
    }
  }
})();

function loadEnvUrl(): void {
  const url = process.env.DATABASE_URL;
  if (!url || !url.startsWith("postgres")) {
    console.error("❌ DATABASE_URL не задано або не схожий на postgresql://. Перевірте .env у корені проєкту.");
    process.exit(1);
  }
  const hostMatch = url.match(/@([^/]+?)(?:\/|$)/);
  if (hostMatch) console.log("   Підключення до:", hostMatch[1]);
}

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
  // Wellness / Choice — тестові товари
  {
    name: "Фітокомплекс Вітаміни та мінерали",
    description: "Комплекс вітамінів та мінералів на рослинній основі для підтримки імунітету та енергії.",
    price: 450,
    old_price: 520,
    discount_percentage: 13,
    top_sale: true,
    limited_edition: false,
    color: "",
    fabric_composition: undefined,
    has_lining: false,
    sizes: [{ size: "O/S", stock: 50 }],
    colors: [],
  },
  {
    name: "Програма корекції ваги Choice",
    description: "Набір для комплексної підтримки метаболізму та контролю ваги. Рослинні компоненти.",
    price: 890,
    old_price: null,
    discount_percentage: null,
    top_sale: true,
    limited_edition: false,
    color: "",
    fabric_composition: undefined,
    has_lining: false,
    sizes: [{ size: "O/S", stock: 30 }],
    colors: [],
  },
  {
    name: "Крем для тіла з екстрактами трав",
    description: "Натуральний догляд за тілом. Зволожує та підживлює шкіру. Без парабенів.",
    price: 320,
    old_price: null,
    discount_percentage: null,
    top_sale: true,
    limited_edition: false,
    color: "",
    fabric_composition: undefined,
    has_lining: false,
    sizes: [{ size: "O/S", stock: 40 }],
    colors: [],
  },
  {
    name: "Еко-засіб для миття посуду",
    description: "Екологічний засіб для дому. Безпечний для здоров'я та навколишнього середовища.",
    price: 180,
    old_price: null,
    discount_percentage: null,
    top_sale: false,
    limited_edition: false,
    color: "",
    fabric_composition: undefined,
    has_lining: false,
    sizes: [{ size: "O/S", stock: 60 }],
    colors: [],
  },
  {
    name: "Набір вітамінів для денного прийому",
    description: "Збалансований комплекс для щоденного прийому. Підтримка організму та вітальність.",
    price: 620,
    old_price: 700,
    discount_percentage: 11,
    top_sale: true,
    limited_edition: false,
    color: "",
    fabric_composition: undefined,
    has_lining: false,
    sizes: [{ size: "O/S", stock: 25 }],
    colors: [],
  },
  {
    name: "Масло для тіла з лавандою",
    description: "Розслаблюючий догляд за тілом. Натуральні олії та ефір лаванди.",
    price: 280,
    old_price: null,
    discount_percentage: null,
    top_sale: false,
    limited_edition: false,
    color: "",
    fabric_composition: undefined,
    has_lining: false,
    sizes: [{ size: "O/S", stock: 35 }],
    colors: [],
  },
  // Бестселлери
  {
    name: "Імунобіотик Choice",
    description: "Популярний комплекс для підтримки імунітету та мікробіому. Рослинні інгредієнти, зручна схема прийому.",
    price: 590,
    old_price: 650,
    discount_percentage: 9,
    top_sale: true,
    limited_edition: false,
    color: "",
    fabric_composition: undefined,
    has_lining: false,
    sizes: [{ size: "O/S", stock: 45 }],
    colors: [],
  },
  {
    name: "Набір для здорового сну",
    description: "Комплекс трав та магнію для спокійного сну та відновлення. Бестселлер сезону.",
    price: 380,
    old_price: 420,
    discount_percentage: 10,
    top_sale: true,
    limited_edition: false,
    color: "",
    fabric_composition: undefined,
    has_lining: false,
    sizes: [{ size: "O/S", stock: 55 }],
    colors: [],
  },
  {
    name: "Детокс-напій з зеленого чаю та імбиру",
    description: "Освіжаючий концентрат для щоденної підтримки обміну речовин. Без цукру, з натуральними екстрактами.",
    price: 240,
    old_price: null,
    discount_percentage: null,
    top_sale: true,
    limited_edition: false,
    color: "",
    fabric_composition: undefined,
    has_lining: false,
    sizes: [{ size: "O/S", stock: 70 }],
    colors: [],
  },
  {
    name: "Коллаген для шкіри та суглобів",
    description: "Морський коллаген з вітаміном C. Підтримка еластичності шкіри та здоров’я суглобів. Топ продажів.",
    price: 720,
    old_price: 800,
    discount_percentage: 10,
    top_sale: true,
    limited_edition: false,
    color: "",
    fabric_composition: undefined,
    has_lining: false,
    sizes: [{ size: "O/S", stock: 38 }],
    colors: [],
  },
  {
    name: "Омега-3 з рослинних джерел",
    description: "Вітамін D3 та омега-3 на основі водоростей. Для серця, судин та імунітету. Дуже популярний товар.",
    price: 410,
    old_price: 460,
    discount_percentage: 11,
    top_sale: true,
    limited_edition: false,
    color: "",
    fabric_composition: undefined,
    has_lining: false,
    sizes: [{ size: "O/S", stock: 52 }],
    colors: [],
  },
];

// Map product names to category names (approximate matching)
const categoryMapping: Record<string, string> = {
  "Шовкова сорочка": "Майки",
  "джинси": "Джинси",
  "пальто": "Пальта",
  "Спортивний": "Спортивний одяг",
  "безрукавка": "Жилетки",
  "купальник": "Майки",
  "шапка": "Головні убори",
  "куртка": "Куртки",
  "майка": "Майки",
  "плащ": "Куртки",
  "Фітокомплекс": "Фітокомплекси та вітаміни",
  "вітамін": "Фітокомплекси та вітаміни",
  "корекції ваги": "Корекція ваги",
  "Крем для тіла": "Догляд за тілом",
  "Масло для тіла": "Догляд за тілом",
  "догляд": "Догляд за тілом",
  "Еко-засіб": "Есо-засоби для дому",
  "есо": "Есо-засоби для дому",
  "Імунобіотик": "Фітокомплекси та вітаміни",
  "здорового сну": "Фітокомплекси та вітаміни",
  "Детокс": "Фітокомплекси та вітаміни",
  "Коллаген": "Догляд за тілом",
  "Омега": "Фітокомплекси та вітаміни",
};

async function main() {
  loadEnvUrl();

  // Перевірка підключення до БД до використання Prisma (уникаємо P1010 через раннє створення пулу)
  const { Pool } = await import("pg");
  const testPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("sslmode=require") ? { rejectUnauthorized: false } : false,
  });
  try {
    const client = await testPool.connect();
    await client.query("SELECT 1");
    client.release();
    await testPool.end();
  } catch (rawErr: unknown) {
    const msg = (rawErr as Error)?.message ?? String(rawErr);
    console.error("\n❌ Не вдалося підключитися до бази даних.");
    if (/database .* does not exist|не існує/i.test(msg)) {
      console.error("   База з DATABASE_URL не існує. Створіть її, наприклад: createdb choice_site_db");
    } else if (/password|access denied|permission/i.test(msg)) {
      console.error("   Перевірте логін і пароль у DATABASE_URL у .env");
    } else {
      console.error("   Помилка:", msg);
    }
    console.error("   Переконайтесь, що PostgreSQL запущений і DATABASE_URL у .env вірний.\n");
    process.exit(1);
  }

  const { prisma } = await import("../lib/prisma");
  const { sqlPostProduct } = await import("../lib/sql");

  try {
    console.log("🚀 Starting to add test products...\n");

    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { priority: "desc" },
    });
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
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === "P1001") {
      console.error("\n❌ Не вдалося підключитися до бази даних (Can't reach database server).");
      console.error("   Перевірте:\n   • чи запущений PostgreSQL (локально або хост з .env);\n   • чи правильний DATABASE_URL у .env;\n   • чи є доступ до сервера (мережа, VPN, файрвол).");
    } else if (code === "P1010") {
      console.error("\n❌ Доступ до бази даних заборонено (User was denied access).");
      console.error("   Перевірте:\n   • чи існує база даних з .env (наприклад: createdb choice_site_db);\n   • чи виконані міграції Prisma (npx prisma migrate deploy);\n   • чи логін/пароль у DATABASE_URL вірні.");
    } else {
      console.error("💥 Fatal error:", error);
    }
    process.exit(1);
  }
}

// Run the script
main()
  .then(() => {
    console.log("\n🎉 Script completed successfully!");
    process.exit(0);
  })
  .catch((error: unknown) => {
    const code = (error as { code?: string })?.code;
    if (code === "P1001") {
      console.error("\n❌ Не вдалося підключитися до бази даних (Can't reach database server).");
      console.error("   Перевірте:\n   • чи запущений PostgreSQL (локально або хост з .env);\n   • чи правильний DATABASE_URL у .env;\n   • чи є доступ до сервера (мережа, VPN, файрвол).");
    } else if (code === "P1010") {
      console.error("\n❌ Доступ до бази даних заборонено (User was denied access).");
      console.error("   Перевірте:\n   • чи існує база даних з .env (наприклад: createdb choice_site_db);\n   • чи виконані міграції Prisma (npx prisma migrate deploy);\n   • чи логін/пароль у DATABASE_URL вірні.");
    } else {
      console.error("\n💥 Script failed:", error);
    }
    process.exit(1);
  });

