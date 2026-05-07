import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { unlink } from "fs/promises";
import path from "path";
import { unstable_cache } from "next/cache";

// Keep sql template literal for backward compatibility (used in migrate route)
// This will be deprecated but kept for now
import { Pool } from "pg";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : false,
});

export const sql = Object.assign(
  async (strings: TemplateStringsArray, ...values: unknown[]) => {
    let query = strings[0];
    for (let i = 0; i < values.length; i++) {
      query += `$${i + 1}` + strings[i + 1];
    }
    const result = await pool.query(query, values);
    return result.rows;
  },
  {
    query: async (strings: TemplateStringsArray, ...values: unknown[]) => {
      let query = strings[0];
      for (let i = 0; i < values.length; i++) {
        query += `$${i + 1}` + strings[i + 1];
      }
      const result = await pool.query(query, values);
      return result.rows;
    },
  }
);

// =====================
// 👕 PRODUCTS
// =====================

// Get all products - optimized for catalog list (only first photo)
async function _sqlGetAllProducts() {
  const products = await prisma.product.findMany({
    orderBy: { id: "desc" },
    include: {
      category: {
        select: { name: true },
      },
      subcategory: {
        select: { name: true },
      },
      media: {
        take: 1,
        orderBy: { id: "asc" },
        select: {
          type: true,
          url: true,
        },
      },
    },
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    description: p.description,
    old_price: p.oldPrice ? Number(p.oldPrice) : null,
    discount_percentage: p.discountPercentage,
    top_sale: p.topSale,
    limited_edition: p.limitedEdition,
    season: p.season,
    category_id: p.categoryId,
    subcategory_id: p.subcategoryId,
    created_at: p.createdAt,
    category_name: p.category?.name || null,
    subcategory_name: p.subcategory?.name || null,
    first_media: p.media[0] ? { type: p.media[0].type, url: p.media[0].url } : null,
  }));
}

// Cached version with 20 minute revalidation
export const sqlGetAllProducts = unstable_cache(
  _sqlGetAllProducts,
  ['all-products'],
  {
    revalidate: 1200, // 20 minutes
    tags: ['products'],
  }
);

// Get one product by ID with sizes & media
export async function sqlGetProduct(id: number) {
  return unstable_cache(
    async () => {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: {
            select: { name: true },
          },
          subcategory: {
            select: { name: true },
          },
          sizes: {
            select: {
              size: true,
              stock: true,
            },
          },
          media: {
            orderBy: { id: "asc" },
            select: {
              type: true,
              url: true,
            },
          },
          colors: {
            select: {
              label: true,
              hex: true,
            },
          },
        },
      });

      if (!product) return null;

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        wholesale_price: product.wholesalePrice
          ? Number(product.wholesalePrice)
          : null,
        old_price: product.oldPrice ? Number(product.oldPrice) : null,
        discount_percentage: product.discountPercentage,
        priority: product.priority,
        top_sale: product.topSale,
        limited_edition: product.limitedEdition,
        season: product.season,
        color: product.color,
        category_id: product.categoryId,
        subcategory_id: product.subcategoryId,
        fabric_composition: product.fabricComposition,
        has_lining: product.hasLining,
        lining_description: product.liningDescription,
        weight_kg: product.weightKg != null ? Number(product.weightKg) : null,
        length_cm: product.lengthCm != null ? Number(product.lengthCm) : null,
        width_cm: product.widthCm != null ? Number(product.widthCm) : null,
        height_cm: product.heightCm != null ? Number(product.heightCm) : null,
        unit_type: product.unitType,
        currency_code: product.currencyCode,
        has_multiple_variants: product.hasMultipleVariants,
        variant_property_name: product.variantPropertyName,
        extra_fields: product.extraFields,
        category_name: product.category?.name || null,
        subcategory_name: product.subcategory?.name || null,
        sizes: product.sizes.map((s) => ({ size: s.size, stock: s.stock })),
        media: product.media.map((m) => ({ type: m.type, url: m.url })),
        colors: product.colors.map((c) => ({ label: c.label, hex: c.hex })),
      };
    },
    [`product-${id}`], // ВАЖЛИВО: унікальний ключ для кожного продукту
    {
      revalidate: 1200, // 20 minutes
      tags: ['products', `product-${id}`],
    }
  )();
}

// Get related color variants by product name
export async function sqlGetRelatedColorsByName(name: string) {
  const products = await prisma.product.findMany({
    where: { name },
    orderBy: { id: "asc" },
    include: {
      colors: {
        take: 1,
        orderBy: { id: "asc" },
        select: {
          label: true,
          hex: true,
        },
      },
    },
  });

  return products.map((p) => {
    const firstColor = p.colors[0]
      ? { label: p.colors[0].label, hex: p.colors[0].hex }
      : p.color
        ? { label: p.color, hex: null }
        : null;

    return {
      id: p.id,
      name: p.name,
      first_color: firstColor,
    };
  });
}

// Get products by category name
export async function sqlGetProductsByCategory(categoryName: string) {
  return unstable_cache(
    async () => {
      const products = await prisma.product.findMany({
        where: {
          category: {
            name: categoryName,
          },
        },
        orderBy: { id: "desc" },
        include: {
          category: {
            select: { name: true },
          },
          media: {
            take: 1,
            orderBy: { id: "asc" },
            select: {
              type: true,
              url: true,
            },
          },
        },
      });

      return products.map((p) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        old_price: p.oldPrice ? Number(p.oldPrice) : null,
        discount_percentage: p.discountPercentage,
        top_sale: p.topSale,
        limited_edition: p.limitedEdition,
        season: p.season,
        category_id: p.categoryId,
        category_name: p.category?.name || null,
        first_media: p.media[0] ? { type: p.media[0].type, url: p.media[0].url } : null,
      }));
    },
    [`products-by-category-${categoryName}`],
    {
      revalidate: 1200, // 20 minutes
      tags: ['products', `category-${categoryName}`],
    }
  )();
}

// Get products by subcategory name
export async function sqlGetProductsBySubcategoryName(name: string) {
  return unstable_cache(
    async () => {
      const products = await prisma.product.findMany({
        where: {
          subcategory: {
            name: {
              equals: name,
              mode: "insensitive",
            },
          },
        },
        orderBy: { id: "desc" },
        include: {
          category: {
            select: { name: true },
          },
          subcategory: {
            select: { name: true },
          },
          media: {
            take: 1,
            orderBy: { id: "asc" },
            select: {
              type: true,
              url: true,
            },
          },
        },
      });

      return products.map((p) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        old_price: p.oldPrice ? Number(p.oldPrice) : null,
        discount_percentage: p.discountPercentage,
        top_sale: p.topSale,
        limited_edition: p.limitedEdition,
        season: p.season,
        category_id: p.categoryId,
        subcategory_id: p.subcategoryId,
        category_name: p.category?.name || null,
        subcategory_name: p.subcategory?.name || null,
        first_media: p.media[0] ? { type: p.media[0].type, url: p.media[0].url } : null,
      }));
    },
    [`products-by-subcategory-${name}`],
    {
      revalidate: 1200, // 20 minutes
      tags: ['products', `subcategory-${name}`],
    }
  )();
}

// Get products by season
export async function sqlGetProductsBySeason(season: string) {
  return unstable_cache(
    async () => {
      const products = await prisma.product.findMany({
        where: {
          season: {
            has: season,
          },
        },
        orderBy: { id: "desc" },
        include: {
          category: {
            select: { name: true },
          },
          media: {
            take: 1,
            orderBy: { id: "asc" },
            select: {
              type: true,
              url: true,
            },
          },
        },
      });

      return products.map((p) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        old_price: p.oldPrice ? Number(p.oldPrice) : null,
        discount_percentage: p.discountPercentage,
        top_sale: p.topSale,
        limited_edition: p.limitedEdition,
        season: p.season,
        category_id: p.categoryId,
        category_name: p.category?.name || null,
        first_media: p.media[0] ? { type: p.media[0].type, url: p.media[0].url } : null,
      }));
    },
    [`products-by-season-${season}`],
    {
      revalidate: 1200, // 20 minutes
      tags: ['products', `season-${season}`],
    }
  )();
}

// Get only top sale products
async function _sqlGetTopSaleProducts() {
  const products = await prisma.product.findMany({
    where: { topSale: true },
    orderBy: { id: "desc" },
    include: {
      media: {
        take: 1,
        orderBy: { id: "asc" },
        select: {
          type: true,
          url: true,
        },
      },
    },
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    old_price: p.oldPrice ? Number(p.oldPrice) : null,
    discount_percentage: p.discountPercentage,
    top_sale: p.topSale,
    limited_edition: p.limitedEdition,
    first_media: p.media[0] ? { type: p.media[0].type, url: p.media[0].url } : null,
  }));
}

// Cached version with 20 minute revalidation
export const sqlGetTopSaleProducts = unstable_cache(
  _sqlGetTopSaleProducts,
  ['top-sale-products'],
  {
    revalidate: 1200, // 20 minutes
    tags: ['products'],
  }
);

// Get only limited edition products
async function _sqlGetLimitedEditionProducts() {
  const products = await prisma.product.findMany({
    where: { limitedEdition: true },
    orderBy: { id: "desc" },
    include: {
      media: {
        take: 1,
        orderBy: { id: "asc" },
        select: {
          type: true,
          url: true,
        },
      },
    },
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    old_price: p.oldPrice ? Number(p.oldPrice) : null,
    discount_percentage: p.discountPercentage,
    top_sale: p.topSale,
    limited_edition: p.limitedEdition,
    first_media: p.media[0] ? { type: p.media[0].type, url: p.media[0].url } : null,
  }));
}

// Cached version with 20 minute revalidation
export const sqlGetLimitedEditionProducts = unstable_cache(
  _sqlGetLimitedEditionProducts,
  ['limited-edition-products'],
  {
    revalidate: 1200, // 20 minutes
    tags: ['products'],
  }
);

// Fetch all distinct colors from the database
export async function sqlGetAllColors() {
  const dbColors = await prisma.product.findMany({
    where: {
      color: {
        not: null,
      },
    },
    select: {
      color: true,
    },
    distinct: ["color"],
    orderBy: {
      color: "asc",
    },
  });

  const standardPalette: Record<string, string> = {
    Чорний: "#000000",
    Білий: "#FFFFFF",
    Сірий: "#808080",
    "Світло-сірий": "#C0C0C0",
    "Темно-сірий": "#4B4B4B",
    Бежевий: "#F5F5DC",
    Кремовий: "#FFFDD0",
    Коричневий: "#8B4513",
    Червоний: "#FF0000",
    Малиновий: "#DC143C",
    Кораловий: "#FF7F50",
    Рожевий: "#FFC0CB",
    Помаранчевий: "#FFA500",
    Жовтий: "#FFD700",
    Зелений: "#008000",
    Хаки: "#78866B",
    Блакитний: "#87CEEB",
    Синій: "#0000FF",
    "Темно-синій": "#00008B",
    Фіолетовий: "#800080",
  };

  const names = new Set<string>([...Object.keys(standardPalette)]);
  for (const row of dbColors) {
    if (row.color) names.add(row.color);
  }

  return Array.from(names)
    .sort()
    .map((name) => ({ color: name, hex: standardPalette[name] }));
}

// Create new product
export async function sqlPostProduct(product: {
  name: string;
  description?: string;
  price: number;
  wholesale_price?: number | null;
  old_price?: number | null;
  discount_percentage?: number | null;
  priority?: number;
  top_sale?: boolean;
  limited_edition?: boolean;
  season?: string[];
  color?: string;
  category_id?: number | null;
  subcategory_id?: number | null;
  fabric_composition?: string;
  has_lining?: boolean;
  lining_description?: string;
  weight_kg?: number | null;
  length_cm?: number | null;
  width_cm?: number | null;
  height_cm?: number | null;
  unit_type?: string;
  currency_code?: string;
  has_multiple_variants?: boolean;
  variant_property_name?: string;
  extra_fields?: string | null;
  sizes?: { size: string; stock: number }[];
  media?: { type: string; url: string }[];
  colors?: { label: string; hex?: string | null }[];
}) {
  const created = await prisma.product.create({
    data: {
      name: product.name,
      description: product.description || null,
      price: product.price,
      wholesalePrice: product.wholesale_price ?? null,
      oldPrice: product.old_price ?? null,
      discountPercentage: product.discount_percentage || null,
      priority: product.priority || 0,
      topSale: product.top_sale || false,
      limitedEdition: product.limited_edition || false,
      season: product.season || [],
      color: product.color || null,
      categoryId: product.category_id || null,
      subcategoryId: product.subcategory_id || null,
      fabricComposition: product.fabric_composition || null,
      hasLining: product.has_lining || false,
      liningDescription: product.lining_description || null,
      weightKg: product.weight_kg ?? null,
      lengthCm: product.length_cm ?? null,
      widthCm: product.width_cm ?? null,
      heightCm: product.height_cm ?? null,
      unitType: product.unit_type?.trim() || "шт",
      currencyCode: product.currency_code?.trim().toUpperCase() || "UAH",
      hasMultipleVariants: product.has_multiple_variants ?? true,
      variantPropertyName: (product.variant_property_name?.trim() || "Колір").slice(
        0,
        80
      ),
      extraFields: product.extra_fields?.trim() || null,
      sizes: product.sizes
        ? {
            create: product.sizes.map((s) => ({
              size: s.size,
              stock: s.stock,
            })),
          }
        : undefined,
      media: product.media
        ? {
            create: product.media.map((m) => ({
              type: m.type,
              url: m.url,
            })),
          }
        : undefined,
      colors: product.colors
        ? {
            create: product.colors.map((c) => ({
              label: c.label,
              hex: c.hex || null,
            })),
          }
        : undefined,
    },
  });

  return { id: created.id };
}

// Update existing product
export async function sqlPutProduct(
  id: number,
  update: {
    name: string;
    description?: string;
    price: number;
    wholesale_price?: number | null;
    old_price?: number | null;
    discount_percentage?: number | null;
    priority?: number;
    top_sale?: boolean;
    limited_edition?: boolean;
    season?: string;
    color?: string;
    category_id?: number | null;
    subcategory_id?: number | null;
    fabric_composition?: string;
    has_lining?: boolean;
    lining_description?: string;
    weight_kg?: number | null;
    length_cm?: number | null;
    width_cm?: number | null;
    height_cm?: number | null;
    unit_type?: string;
    currency_code?: string;
    has_multiple_variants?: boolean;
    variant_property_name?: string;
    extra_fields?: string | null;
    sizes?: { size: string; stock: number }[];
    media?: { type: string; url: string }[];
    colors?: { label: string; hex?: string | null }[];
  }
) {
  // Step 1: Fetch old media URLs before deleting
  const oldMedia = await prisma.productMedia.findMany({
    where: { productId: id },
    select: { url: true },
  });
  const oldMediaUrls = oldMedia.map((m) => m.url);
  const newMediaUrls = (update.media || []).map((m) => m.url);

  // Step 2: Determine which files to DELETE from disk
  const filesToDelete = oldMediaUrls.filter(
    (oldUrl) => !newMediaUrls.includes(oldUrl)
  );

  // Step 3: Update product and related data in transaction
  await prisma.$transaction(async (tx) => {
    console.log(`[sqlPutProduct] Updating product ${id} with limited_edition: ${update.limited_edition}`);
    
    // Update main product fields
    const updated = await tx.product.update({
      where: { id },
      data: {
        name: update.name,
        description: update.description || null,
        price: update.price,
        wholesalePrice: update.wholesale_price ?? null,
        oldPrice: update.old_price || null,
        discountPercentage: update.discount_percentage || null,
        priority: update.priority || 0,
        topSale: update.top_sale || false,
        limitedEdition: update.limited_edition === true,
        season: update.season ? (Array.isArray(update.season) ? update.season : JSON.parse(update.season)) : [],
        color: update.color || null,
        categoryId: update.category_id || null,
        subcategoryId: update.subcategory_id || null,
        fabricComposition: update.fabric_composition || null,
        hasLining: update.has_lining || false,
        liningDescription: update.lining_description || null,
        weightKg: update.weight_kg ?? null,
        lengthCm: update.length_cm ?? null,
        widthCm: update.width_cm ?? null,
        heightCm: update.height_cm ?? null,
        unitType: update.unit_type?.trim() || "шт",
        currencyCode: update.currency_code?.trim().toUpperCase() || "UAH",
        hasMultipleVariants: update.has_multiple_variants ?? true,
        variantPropertyName: (update.variant_property_name?.trim() || "Колір").slice(
          0,
          80
        ),
        extraFields: update.extra_fields?.trim() || null,
      },
    });
    
    console.log(`[sqlPutProduct] Product ${id} updated. limitedEdition in DB: ${updated.limitedEdition}`);

    // Delete old sizes, media, colors
    await tx.productSize.deleteMany({ where: { productId: id } });
    await tx.productMedia.deleteMany({ where: { productId: id } });
    await tx.productColor.deleteMany({ where: { productId: id } });

    // Re-insert new sizes
    if (update.sizes?.length) {
      await tx.productSize.createMany({
        data: update.sizes.map((s) => ({
          productId: id,
          size: s.size,
          stock: s.stock,
        })),
      });
    }

    // Re-insert new media
    if (update.media?.length) {
      await tx.productMedia.createMany({
        data: update.media.map((m) => ({
          productId: id,
          type: m.type,
          url: m.url,
        })),
      });
    }

    // Re-insert new colors
    if (update.colors?.length) {
      await tx.productColor.createMany({
        data: update.colors.map((c) => ({
          productId: id,
          label: c.label,
          hex: c.hex || null,
        })),
      });
    }
  });

  // Step 4: Delete unused image files from disk
  for (const url of filesToDelete) {
    const filePath = path.join(process.cwd(), "product-images", url);
    try {
      await unlink(filePath);
      console.log(`✓ Deleted unused file: ${url}`);
    } catch (error) {
      console.error(`Failed to delete image: ${filePath}`, error);
    }
  }

  return { updated: true };
}

export async function sqlDeleteProduct(id: number) {
  // Step 1: Get media URLs
  const media = await prisma.productMedia.findMany({
    where: { productId: id },
    select: { url: true },
  });

  // Step 2: Delete the product (cascade removes sizes/media/colors, order_items.productId will be set to null)
  await prisma.product.delete({
    where: { id },
  });

  // Step 3: Delete files from disk
  for (const { url } of media) {
    const filePath = path.join(process.cwd(), "product-images", url);
    try {
      await unlink(filePath);
    } catch (error) {
      console.error(`Failed to delete image: ${filePath}`, error);
    }
  }

  return { deleted: true };
}

// =====================
// 📬 ORDERS
// =====================

// Get all orders (without items for performance)
export async function sqlGetAllOrders() {
  const orders = await prisma.order.findMany({
    where: { paymentStatus: "paid" },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((o) => ({
    id: o.id,
    customer_name: o.customerName,
    phone_number: o.phoneNumber,
    email: o.email,
    delivery_method: o.deliveryMethod,
    city: o.city,
    post_office: o.postOffice,
    nova_poshta_ttn: o.novaPoshtaTtn ?? null,
    np_status_code: o.npStatusCode ?? null,
    np_status_name: o.npStatusName ?? null,
    comment: o.comment,
    payment_type: o.paymentType,
    invoice_id: o.invoiceId,
    payment_status: o.paymentStatus,
    status: o.status,
    created_at: o.createdAt,
  }));
}

// Get order with items
export async function sqlGetOrder(id: number) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!order) return null;

  return {
    id: order.id,
    customer_name: order.customerName,
    phone_number: order.phoneNumber,
    email: order.email,
    delivery_method: order.deliveryMethod,
    city: order.city,
    post_office: order.postOffice,
    nova_poshta_ttn: order.novaPoshtaTtn ?? null,
    np_status_code: order.npStatusCode ?? null,
    np_status_name: order.npStatusName ?? null,
    keycrm_order_id: order.keycrmOrderId ?? null,
    keycrm_buyer_id: order.keycrmBuyerId ?? null,
    comment: order.comment,
    payment_type: order.paymentType,
    invoice_id: order.invoiceId,
    payment_status: order.paymentStatus,
    status: order.status,
    created_at: order.createdAt,
    items: order.items.map((item) => ({
      id: item.id,
      order_id: item.orderId,
      product_id: item.productId,
      product_name: item.product?.name || `Product #${item.productId}`,
      size: item.size,
      quantity: item.quantity,
      price: Number(item.price),
      color: item.color,
    })),
  };
}

type OrderInput = {
  user_id?: string | null;
  customer_name: string;
  phone_number: string;
  email?: string;
  delivery_method: string;
  city: string;
  post_office: string;
  comment?: string;
  payment_type: "prepay" | "full" | "pay_after" | "test_payment" | "installment" | "crypto";
  invoice_id: string;
  payment_status: "pending" | "paid" | "canceled";
  bonus_points_spent?: number;
  loyalty_discount_amount?: number;
  items: {
    product_id: number;
    size: string;
    quantity: number;
    price: number;
    color?: string | null;
  }[];
};

export async function sqlPostOrder(order: OrderInput) {
  // Raw INSERT по мінімальному набору колонок — щоб оформлення замовлення працювало
  // навіть якщо частина міграцій Prisma ще не застосована в БД (bonus/np/keycrm тощо).
  return await prisma.$transaction(async (tx) => {
    let rows: [{ id: number }];
    try {
      rows = await tx.$queryRaw<[{ id: number }]>`
        INSERT INTO orders (customer_name, phone_number, email, delivery_method, city, post_office, comment, payment_type, invoice_id, payment_status, user_id)
        VALUES (${order.customer_name}, ${order.phone_number}, ${order.email ?? null}, ${order.delivery_method}, ${order.city}, ${order.post_office}, ${order.comment ?? null}, ${order.payment_type}, ${order.invoice_id}, ${order.payment_status}, ${order.user_id ?? null})
        RETURNING id
      `;
    } catch (err) {
      const msg = String((err as Error).message ?? "");
      if (msg.includes("user_id") && msg.includes("does not exist")) {
        rows = await tx.$queryRaw<[{ id: number }]>`
          INSERT INTO orders (customer_name, phone_number, email, delivery_method, city, post_office, comment, payment_type, invoice_id, payment_status)
          VALUES (${order.customer_name}, ${order.phone_number}, ${order.email ?? null}, ${order.delivery_method}, ${order.city}, ${order.post_office}, ${order.comment ?? null}, ${order.payment_type}, ${order.invoice_id}, ${order.payment_status})
          RETURNING id
        `;
      } else {
        throw err;
      }
    }
    const createdId = rows[0].id;

    for (const item of order.items) {
      await tx.orderItem.create({
        data: {
          orderId: createdId,
          productId: item.product_id,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          color: item.color ?? null,
        },
      });
    }

    const bonusSpent = order.bonus_points_spent ?? 0;
    if (bonusSpent > 0) {
      try {
        await tx.$executeRaw`UPDATE orders SET bonus_points_spent = ${bonusSpent} WHERE id = ${createdId}`;
      } catch {
        /* колонка bonus_points_spent може відсутня */
      }
    }

    const loyaltyDiscount = order.loyalty_discount_amount ?? 0;
    if (loyaltyDiscount > 0) {
      try {
        await tx.$executeRaw`UPDATE orders SET loyalty_discount_amount = ${loyaltyDiscount} WHERE id = ${createdId}`;
      } catch {
        /* колонка loyalty_discount_amount може відсутня */
      }
    }

    return { orderId: createdId };
  });
}

// Update an order (e.g., status change)
export async function sqlPutOrder(id: number, update: { status: string }) {
  await prisma.order.update({
    where: { id },
    data: { status: update.status },
  });
  return { updated: true };
}

// Delete an order (auto-deletes items via ON DELETE CASCADE)
export async function sqlDeleteOrder(id: number) {
  await prisma.order.delete({
    where: { id },
  });
  return { deleted: true };
}

// Get all order items for a specific order
export async function sqlGetOrderItems(orderId: number) {
  const items = await prisma.orderItem.findMany({
    where: { orderId },
    include: {
      product: {
        select: { name: true },
      },
    },
    orderBy: { id: "asc" },
  });

  return items.map((item) => ({
    id: item.id,
    order_id: item.orderId,
    product_id: item.productId,
    product_name: item.product?.name || `Product #${item.productId}`,
    size: item.size,
    quantity: item.quantity,
    price: Number(item.price),
    color: item.color,
  }));
}

// Create a single order item
export async function sqlPostOrderItem(item: {
  order_id: number;
  product_id: number;
  size: string;
  quantity: number;
  price: number;
}) {
  const created = await prisma.orderItem.create({
    data: {
      orderId: item.order_id,
      productId: item.product_id,
      size: item.size,
      quantity: item.quantity,
            price: item.price,
    },
    include: {
      product: {
        select: { name: true },
      },
    },
  });

  return {
    id: created.id,
    order_id: created.orderId,
    product_id: created.productId,
    product_name: created.product?.name || `Product #${created.productId}`,
    size: created.size,
    quantity: created.quantity,
    price: Number(created.price),
    color: created.color,
  };
}

// Update (edit) an order item
export async function sqlPutOrderItem(
  id: number,
  update: {
    product_id?: number;
    size?: string;
    quantity?: number;
    price?: number;
  }
) {
  const updated = await prisma.orderItem.update({
    where: { id },
    data: {
      productId: update.product_id,
      size: update.size,
      quantity: update.quantity,
      price: update.price,
    },
    include: {
      product: {
        select: { name: true },
      },
    },
  });

  return {
    id: updated.id,
    order_id: updated.orderId,
    product_id: updated.productId,
    product_name: updated.product?.name || `Product #${updated.productId}`,
    size: updated.size,
    quantity: updated.quantity,
    price: Number(updated.price),
    color: updated.color,
  };
}

// Delete order item
export async function sqlDeleteOrderItem(id: number) {
  await prisma.orderItem.delete({
    where: { id },
  });
  return { deleted: true };
}

export async function sqlUpdatePaymentStatus(
  invoiceId: string,
  status: string
) {
  await prisma.order.update({
    where: { invoiceId },
    data: { paymentStatus: status },
  });
}

// Get order by invoice ID for webhook processing (same imageUrl shape as basket/FinalCard)
export async function sqlGetOrderByInvoiceId(invoiceId: string) {
  const order = await prisma.order.findUnique({
    where: { invoiceId },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              media: {
                orderBy: { id: "asc" },
                take: 5,
                select: { url: true, type: true },
              },
            },
          },
        },
      },
    },
  });

  if (!order) return null;

  return {
    id: order.id,
    invoice_id: order.invoiceId,
    customer_name: order.customerName,
    phone_number: order.phoneNumber,
    email: order.email,
    delivery_method: order.deliveryMethod,
    city: order.city,
    post_office: order.postOffice,
    comment: order.comment,
    payment_type: order.paymentType,
    payment_status: order.paymentStatus,
    nova_poshta_ttn: order.novaPoshtaTtn ?? null,
    np_status_code: order.npStatusCode ?? null,
    np_status_name: order.npStatusName ?? null,
    created_at: order.createdAt,
    items: order.items.map((item) => {
      const product = item.product as { name: string; media?: { url: string; type: string }[] } | null;
      const firstPhoto = product?.media?.find((m) => m.type === "photo");
      const imageUrl = firstPhoto?.url ?? product?.media?.[0]?.url ?? null;
      return {
        product_name: product?.name || `Product #${item.productId}`,
        size: item.size,
        quantity: item.quantity,
        price: Number(item.price),
        color: item.color,
        imageUrl,
      };
    }),
  };
}

// =====================
// 📦 CATEGORIES
// =====================

// Get all categories
async function _sqlGetAllCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { priority: "desc" },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    priority: c.priority,
    mediaType: c.mediaType || null,
    mediaUrl: c.mediaUrl || null,
  }));
}

// Cached version with 20 minute revalidation
export const sqlGetAllCategories = unstable_cache(
  _sqlGetAllCategories,
  ['all-categories'],
  {
    revalidate: 1200, // 20 minutes
    tags: ['categories'],
  }
);

// Get a single category by ID
export async function sqlGetCategory(id: number) {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) return null;

  return {
    id: category.id,
    name: category.name,
    priority: category.priority,
    mediaType: category.mediaType || null,
    mediaUrl: category.mediaUrl || null,
  };
}

// Create a new category
export async function sqlPostCategory(
  name: string, 
  priority: number = 0,
  mediaType?: string | null,
  mediaUrl?: string | null
) {
  const createData: {
    name: string;
    priority: number;
    mediaType?: string | null;
    mediaUrl?: string | null;
  } = { 
    name, 
    priority,
  };

  if (mediaType !== undefined) {
    createData.mediaType = mediaType;
  }
  if (mediaUrl !== undefined) {
    createData.mediaUrl = mediaUrl;
  }

  const created = await prisma.category.create({
    data: createData,
  });

  return {
    id: created.id,
    name: created.name,
    priority: created.priority,
    mediaType: created.mediaType,
    mediaUrl: created.mediaUrl,
  };
}

// Update a category by ID
export async function sqlPutCategory(
  id: number,
  name: string,
  priority: number = 0,
  mediaType?: string | null,
  mediaUrl?: string | null
) {
  const updateData: {
    name: string;
    priority: number;
    mediaType?: string | null;
    mediaUrl?: string | null;
  } = { 
    name, 
    priority,
  };
  
  if (mediaType !== undefined) {
    updateData.mediaType = mediaType;
  }
  if (mediaUrl !== undefined) {
    updateData.mediaUrl = mediaUrl;
  }

  const updated = await prisma.category.update({
    where: { id },
    data: updateData,
  });

  return {
    id: updated.id,
    name: updated.name,
    priority: updated.priority,
  };
}

// Delete a category by ID
export async function sqlDeleteCategory(id: number) {
  await prisma.category.delete({
    where: { id },
  });
  return { deleted: true };
}

// =====================
// 📦 SUBCATEGORIES
// =====================

// Get all subcategories
export async function sqlGetAllSubcategories() {
  const subcategories = await prisma.subcategory.findMany({
    orderBy: { id: "asc" },
  });

  return subcategories.map((sc) => ({
    id: sc.id,
    name: sc.name,
    category_id: sc.categoryId,
  }));
}

// Get all subcategories for a specific category
export async function sqlGetSubcategoriesByCategory(categoryId: number) {
  const subcategories = await prisma.subcategory.findMany({
    where: { categoryId },
    orderBy: { id: "asc" },
  });

  return subcategories.map((sc) => ({
    id: sc.id,
    name: sc.name,
    category_id: sc.categoryId,
  }));
}

// Get a single subcategory by ID
export async function sqlGetSubcategory(id: number) {
  const subcategory = await prisma.subcategory.findUnique({
    where: { id },
  });

  if (!subcategory) return null;

  return {
    id: subcategory.id,
    name: subcategory.name,
    category_id: subcategory.categoryId,
  };
}

// Create a new subcategory
export async function sqlPostSubcategory(name: string, categoryId: number) {
  const created = await prisma.subcategory.create({
    data: { name, categoryId },
  });

  return {
    id: created.id,
    name: created.name,
    category_id: created.categoryId,
  };
}

// Update a subcategory by ID
export async function sqlPutSubcategory(
  id: number,
  name: string,
  categoryId: number
) {
  const updated = await prisma.subcategory.update({
    where: { id },
    data: { name, categoryId },
  });

  return {
    id: updated.id,
    name: updated.name,
    category_id: updated.categoryId,
  };
}

// Delete a subcategory by ID
export async function sqlDeleteSubcategory(id: number) {
  await prisma.subcategory.delete({
    where: { id },
  });
  return { deleted: true };
}
