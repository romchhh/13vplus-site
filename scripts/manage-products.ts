#!/usr/bin/env ts-node
/**
 * Скрипт для додавання та видалення товарів.
 * Використання:
 *   npx ts-node scripts/manage-products.ts add              — додати два товари (D3, Антипаразитарна програма)
 *   npx ts-node scripts/manage-products.ts delete <slug|id>  — видалити товар за slug або id
 *   npx ts-node scripts/manage-products.ts delete "міцелярний" "антипаразитарна"  — видалити за частиною назви
 */

import fs from "node:fs";
import path from "node:path";

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

const PRODUCTS_TO_ADD = [
  {
    name: "Міцелярний вітамін D3 PRO Healthy",
    subtitle:
      "Міцелярна формула вітаміну D3 для щоденної підтримки імунітету, здоров'я кісток і загального балансу організму.",
    release_form: "краплі, 10 мл",
    course: null as string | null,
    package_weight: "10 мл",
    main_info: `Форма випуску: краплі
Об'єм: 10 мл
Форма: міцелярний розчин
Категорія: Імунітет і відновлення
Ціна: 489 грн`,
    short_description:
      "PRO Healthy D3 - міцелярна форма вітаміну D3 з високою біодоступністю для підтримки імунної системи, здоров'я кісток і гормонального балансу. Завдяки міцелярній технології вітамін D3 добре засвоюється навіть при порушеннях травлення і обміну жирів. Підходить для щоденного використання дорослими і дітьми від 5 років",
    description: `PRO Healthy D3 — це діетична добавка на основі холекальциферолу у міцелярній формі, створена для підтримки імунної системи, опорно-рухового апарату і загального фізіологічного балансу.

Завдяки використанню швейцарського компонента PHOSAL® Н 50 активна речовина проходить процес емульгування, утворюючи стабільні міцели - мікроскопічні частинки, які забезпечують рівномірний розподіл вітаміну D3 у водному середовищі і його ефективне засвоєння організмом.

Міцелярна технологія забезпечує високу біодоступність і ефективність навіть при низьких дозах. Вітамін D бере участь у регуляції обміну кальцію і фосфору, підтримує щільність кісткової тканини, роботу м'язів, імунної і нервової систем.

Регулярне використання сприяє зміцненню імунітету, підтримці енергетичного балансу і загального самопочуття.`,
    main_action: `• підтримує імунну систему
• сприяє мінералізації кісткової тканини
• підтримує здоров'я зубів і кісток
• підтримує функцію м'язів
• сприяє гормональному балансу
• підтримує нервову систему
• сприяє підтримці когнітивних функцій
• підтримує здоров'я шкіри`,
    indications_for_use: `Рекомендується:
• для підтримки гормонального балансу
• для підтримки загального самопочуття`,
    benefits: `• міцелярна форма забезпечує високу біодоступність
• ефективне засвоєння навіть при порушеннях травлення
• стабільність у водному середовищі
• ефективність при низьких дозах
• підтримка імунної, нервової та ендокринної систем
• зручна форма крапель`,
    full_composition: `Склад на флакон 10 мл:
Основна речовина:
Вітамін D3 (холекальциферол) - 120 000 МО

1 крапля містить:
10 мкг вітаміну D3 (400 МО)

Допоміжні речовини:
MCT олія з кокосу для ефективного транспортування речовини
PHOSAL® H 50 — фосфатидилхолін із соняшникової олії (без ГМО)
DL-альфа-токоферол - антиоксидантна підтримка`,
    usage_method: `Перед використанням флакон струсити.
Дорослі (50 мкг/2000 МО): 1 раз на день під час їди.
Діти від 5 років (400 МО): 1 раз на день під час їди.
Краплі додати до невеликої кількості води.
Рекомендований курс - 1 місяць.`,
    contraindications:
      "Не рекомендується при індивідуальній непереносимості компонентів продукту. Вагітність і період лактації — за рекомендацією лікаря.",
    storage_conditions:
      "Зберігати в сухому, захищеному від світла місці при температурі не вище 25°C. Зберігати в недоступному для дітей місці.",
    price: 489,
    old_price: null as number | null,
    discount_percentage: null as number | null,
    stock: 100,
    in_stock: true,
    top_sale: false,
    category_name: "Імунітет і відновлення",
    subcategory_name: null as string | null,
  },
  {
    name: "Антипаразитарна програма для дітей 6–12 років CHOICE PHYTO",
    subtitle:
      "Комплексна фітопрограма для очищення організму дитини від паразитів, підтримки імунітету і відновлення мікрофлори.",
    release_form: "комплексна програма (капсули)",
    course: "60 днів",
    package_weight: null as string | null,
    main_info: `Тип продукту: комплексна програма
Тривалість курсу: 60 днів
Вік: 6–12 років
Категорія: Набори і програми / Дитяче здоров'я
Ціна: 1996 грн`,
    short_description:
      "Антипаразитарна програма CHOICE PHYTO для дітей 6–12 років — це комплекс рослинних фітокомплексів, спрямований на очищення організму від паразитів, підтримку імунної системи і відновлення мікрофлори кишечника. Програма допомагає зменшити токсичне навантаження, підтримує роботу печінки і травної системи та сприяє загальному відновленню організму дитини.",
    description: `Дитяча антипаразитарна програма CHOICE PHYTO створена на основі натуральних рослинних фітокомплексів для комплексного очищення організму дитини від паразитів, продуктів їх життєдіяльності і супутніх токсинів.

Програма працює поетапно протягом 60 днів, що дозволяє впливати на паразитів на різних стадіях розвитку — від личинок до дорослих форм, а також підтримує природні механізми очищення організму.

Активні рослинні компоненти сприяють очищенню кишечника, підтримці функції печінки, відновленню мікрофлори і зміцненню імунної системи.

Програма також сприяє зменшенню проявів алергічних реакцій, підтримує здоров'я шкіри, покращує апетит і загальний стан організму.`,
    main_action: `• здійснює комплексну протипаразитарну дію
• підтримує імунну систему
• має протигрибкові і протимікробні властивості
• сприяє очищенню кишечника
• підтримує роботу печінки і жовчного міхура
• сприяє відновленню корисної мікрофлори
• підтримує травлення
• сприяє загальному відновленню організму`,
    indications_for_use: `• при паразитарних інвазіях
• при частих захворюваннях
• при дисбактеріозі
• при зниженому імунітеті
• при алергічних реакціях і дерматитах
• при порушеннях травлення
• для профілактичного очищення організму`,
    benefits: `• комплексний підхід до очищення організму
• рослинні компоненти
• вплив на різні стадії розвитку паразитів
• підтримка імунної системи
• підтримка печінки і травлення
• відновлення мікрофлори
• зручна схема використання`,
    full_composition: `Програма включає:
АНТИПАРАЗИТ — 3 упаковки
ЛАЙФГАРД — 1 упаковка
ЛІВСЕЙФ — 2 упаковки
БРЕЙКБЛОК — 1 упаковка
Ф.АКТИВ — 1 упаковка

Дія компонентів програми:
АНТИПАРАЗИТ — натуральний фітокомплекс, який діє проти більшості паразитів. Сприяє їх виведенню і перешкоджає повторному розвитку.
БРЕЙКБЛОК — сприяє очищенню кишечника, підтримує нормальну перистальтику і мікрофлору.
ЛАЙФГАРД — підтримує імунну систему, сприяє захисту організму і відновленню після інфекційних навантажень.
ЛІВСЕЙФ — підтримує функцію печінки, сприяє детоксикації і покращує процес травлення.
Ф.АКТИВ — джерело фітоферментів, які підтримують травлення і сприяють відновленню роботи травної системи.

Схема використання (60 днів):
1-й місяць: Ранок — Антипаразит 1 капсула, Лайфгард 1 капсула. Вечір — Брейкблок 1 капсула, Лівсейф 1 капсула.
2-й місяць: Ранок — Антипаразит 1 капсула, Ф.Актив 1 капсула. Вечір — Антипаразит 1 капсула, Лівсейф 1 капсула.
Усі фітокомплекси приймати за 15–20 хвилин до їди, запиваючи водою.`,
    usage_method: `Тривалість програми — 60 днів.
Усі фітокомплекси приймати за 15–20 хвилин до їди, запиваючи водою.`,
    contraindications:
      "Вік до 6 років. Індивідуальна підвищена чутливість до компонентів.",
    storage_conditions:
      "Зберігати в сухому місці при температурі не вище 25°C. Зберігати в недоступному для дітей місці.",
    price: 1996,
    old_price: null as number | null,
    discount_percentage: null as number | null,
    stock: 50,
    in_stock: true,
    top_sale: false,
    category_name: "Набори і програми",
    subcategory_name: "Дитяче здоров'я",
  },
];

async function resolveCategoryIds(
  prisma: import("@prisma/client").PrismaClient,
  categoryName: string,
  subcategoryName: string | null
): Promise<{ category_id: number | null; subcategory_id: number | null }> {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
  });
  const cat = categories.find(
    (c) => c.name.toLowerCase() === categoryName.toLowerCase()
  );
  if (!cat) {
    return { category_id: null, subcategory_id: null };
  }
  let subcategoryId: number | null = null;
  if (subcategoryName) {
    const subcategories = await prisma.subcategory.findMany({
      where: { categoryId: cat.id },
      select: { id: true, name: true, categoryId: true },
    });
    const sub = subcategories.find(
      (s) => s.name.toLowerCase() === subcategoryName.toLowerCase()
    );
    if (sub) subcategoryId = sub.id;
  }
  return { category_id: cat.id, subcategory_id: subcategoryId };
}

async function addProducts() {
  const { prisma } = await import("../lib/prisma");
  const { sqlPostProduct } = await import("../lib/sql");

  console.log("📦 Додавання товарів...\n");
  for (const p of PRODUCTS_TO_ADD) {
    const { category_name, subcategory_name, ...rest } = p;
    const { category_id, subcategory_id } = await resolveCategoryIds(
      prisma,
      category_name,
      subcategory_name
    );
    if (!category_id) {
      console.warn(
        `⚠ Категорію "${category_name}" не знайдено. Товар буде додано без категорії.`
      );
    }
    const payload = {
      ...rest,
      category_id,
      subcategory_id,
      media: [],
    };
    const result = await sqlPostProduct(payload);
    console.log(`✅ Додано: ${p.name} (ID: ${result.id})`);
  }
  console.log("\n✨ Готово.");
}

async function deleteProducts(args: string[]) {
  if (args.length === 0) {
    console.error("Вкажіть slug, id або частину назви товару для видалення.");
    console.error("Приклад: npx ts-node scripts/manage-products.ts delete mitselyarnyi-vitamin-d3");
    process.exit(1);
  }

  const { prisma } = await import("../lib/prisma");
  const { sqlDeleteProduct } = await import("../lib/sql");

  console.log("🗑 Видалення товарів...\n");
  for (const q of args) {
    const trimmed = q.trim();
    if (!trimmed) continue;

    let product: { id: number; name: string; slug: string | null } | null = null;

    const idNum = parseInt(trimmed, 10);
    if (String(idNum) === trimmed) {
      product = await prisma.product.findUnique({
        where: { id: idNum },
        select: { id: true, name: true, slug: true },
      });
    }
    if (!product) {
      product = await prisma.product.findFirst({
        where: { slug: trimmed },
        select: { id: true, name: true, slug: true },
      });
    }
    if (!product) {
      const all = await prisma.product.findMany({
        select: { id: true, name: true, slug: true },
      });
      product =
        all.find(
          (p) =>
            p.name.toLowerCase().includes(trimmed.toLowerCase()) ||
            (p.slug && p.slug.toLowerCase().includes(trimmed.toLowerCase()))
        ) || null;
    }

    if (!product) {
      console.warn(`⚠ Товар не знайдено: "${trimmed}"`);
      continue;
    }
    await sqlDeleteProduct(product.id);
    console.log(`✅ Видалено: ${product.name} (ID: ${product.id})`);
  }
  console.log("\n✨ Готово.");
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url || !url.startsWith("postgres")) {
    console.error(
      "❌ DATABASE_URL не задано або не схожий на postgresql://. Перевірте .env."
    );
    process.exit(1);
  }

  const cmd = process.argv[2]?.toLowerCase();
  const restArgs = process.argv.slice(3);

  if (cmd === "add") {
    await addProducts();
  } else if (cmd === "delete") {
    await deleteProducts(restArgs);
  } else {
    console.error("Використання:");
    console.error("  npx ts-node scripts/manage-products.ts add");
    console.error(
      '  npx ts-node scripts/manage-products.ts delete <slug|id|"частина назви"> [...]'
    );
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("💥 Помилка:", err);
    process.exit(1);
  });
