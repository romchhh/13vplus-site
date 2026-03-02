import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { unlink } from "fs/promises";
import path from "path";
import { unstable_cache } from "next/cache";
import { textToSlug, ensureUniqueSlug } from "./slug";

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
    slug: p.slug ?? null,
    price: Number(p.price),
    description: p.description,
    old_price: p.oldPrice ? Number(p.oldPrice) : null,
    discount_percentage: p.discountPercentage,
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

// Get one product by ID with media and stock
export async function sqlGetProduct(id: number) {
  return unstable_cache(
    async () => {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: { select: { name: true, slug: true } },
          subcategory: { select: { name: true } },
          media: { orderBy: { id: "asc" }, select: { type: true, url: true } },
        },
      });

      if (!product) return null;

      return {
        id: product.id,
        name: product.name,
        slug: product.slug ?? null,
        subtitle: product.subtitle ?? null,
        release_form: product.releaseForm ?? null,
        course: product.course ?? null,
        package_weight: product.packageWeight ?? null,
        main_info: product.mainInfo ?? null,
        short_description: product.shortDescription ?? null,
        description: product.description ?? null,
        main_action: product.mainAction ?? null,
        indications_for_use: product.indicationsForUse ?? null,
        benefits: product.benefits ?? null,
        full_composition: product.fullComposition ?? null,
        usage_method: product.usageMethod ?? null,
        contraindications: product.contraindications ?? null,
        storage_conditions: product.storageConditions ?? null,
        price: Number(product.price),
        old_price: product.oldPrice ? Number(product.oldPrice) : null,
        discount_percentage: product.discountPercentage,
        priority: product.priority,
        top_sale: product.topSale,
        in_stock: product.inStock,
        limited_edition: product.limitedEdition,
        stock: product.stock,
        category_id: product.categoryId,
        subcategory_id: product.subcategoryId,
        fabric_composition: product.fabricComposition ?? null,
        has_lining: product.hasLining,
        lining_description: product.liningDescription ?? null,
        category_name: product.category?.name || null,
        category_slug: product.category?.slug ?? null,
        subcategory_name: product.subcategory?.name || null,
        media: product.media.map((m: { type: string; url: string }) => ({ type: m.type, url: m.url })),
      };
    },
    [`product-${id}`],
    { revalidate: 1200, tags: ['products', `product-${id}`] }
  )();
}

// Get one product by slug (ЧПУ)
export async function sqlGetProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug: slug || undefined },
    include: {
      category: { select: { name: true, slug: true } },
      subcategory: { select: { name: true } },
      media: { orderBy: { id: "asc" }, select: { type: true, url: true } },
    },
  });
  if (!product) return null;
  return {
    id: product.id,
    name: product.name,
    slug: product.slug ?? null,
    subtitle: product.subtitle ?? null,
    release_form: product.releaseForm ?? null,
    course: product.course ?? null,
    package_weight: product.packageWeight ?? null,
    main_info: product.mainInfo ?? null,
    short_description: product.shortDescription ?? null,
    description: product.description ?? null,
    main_action: product.mainAction ?? null,
    indications_for_use: product.indicationsForUse ?? null,
    benefits: product.benefits ?? null,
    full_composition: product.fullComposition ?? null,
    usage_method: product.usageMethod ?? null,
    contraindications: product.contraindications ?? null,
    storage_conditions: product.storageConditions ?? null,
    price: Number(product.price),
    old_price: product.oldPrice ? Number(product.oldPrice) : null,
    discount_percentage: product.discountPercentage,
    priority: product.priority,
    top_sale: product.topSale,
    in_stock: product.inStock,
    limited_edition: product.limitedEdition,
    stock: product.stock,
    category_id: product.categoryId,
    subcategory_id: product.subcategoryId,
    fabric_composition: product.fabricComposition ?? null,
    has_lining: product.hasLining,
    lining_description: product.liningDescription ?? null,
    category_name: product.category?.name || null,
    subcategory_name: product.subcategory?.name || null,
    category_slug: product.category?.slug ?? null,
    media: product.media.map((m) => ({ type: m.type, url: m.url })),
  };
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
        slug: p.slug ?? null,
        price: Number(p.price),
        old_price: p.oldPrice ? Number(p.oldPrice) : null,
        discount_percentage: p.discountPercentage,
        top_sale: p.topSale,
        limited_edition: p.limitedEdition,
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
        slug: p.slug ?? null,
        price: Number(p.price),
        old_price: p.oldPrice ? Number(p.oldPrice) : null,
        discount_percentage: p.discountPercentage,
        top_sale: p.topSale,
        limited_edition: p.limitedEdition,
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
    slug: p.slug ?? null,
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
    slug: p.slug ?? null,
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

// Create new product
export async function sqlPostProduct(product: {
  name: string;
  subtitle?: string | null;
  release_form?: string | null;
  course?: string | null;
  package_weight?: string | null;
  main_info?: string | null;
  short_description?: string | null;
  description?: string | null;
  main_action?: string | null;
  indications_for_use?: string | null;
  benefits?: string | null;
  full_composition?: string | null;
  usage_method?: string | null;
  contraindications?: string | null;
  storage_conditions?: string | null;
  price: number;
  old_price?: number | null;
  discount_percentage?: number | null;
  priority?: number;
  top_sale?: boolean;
  in_stock?: boolean;
  limited_edition?: boolean;
  stock?: number;
  category_id?: number | null;
  subcategory_id?: number | null;
  fabric_composition?: string | null;
  has_lining?: boolean;
  lining_description?: string | null;
  media?: { type: string; url: string }[];
}) {
  const baseSlug = textToSlug(product.name);
  const slug = await ensureUniqueSlug(baseSlug, (s) =>
    prisma.product.findFirst({ where: { slug: s } }).then(Boolean)
  );

  const created = await prisma.product.create({
    data: {
      name: product.name,
      slug,
      subtitle: product.subtitle ?? null,
      releaseForm: product.release_form ?? null,
      course: product.course ?? null,
      packageWeight: product.package_weight ?? null,
      mainInfo: product.main_info ?? null,
      shortDescription: product.short_description ?? null,
      description: product.description ?? null,
      mainAction: product.main_action ?? null,
      indicationsForUse: product.indications_for_use ?? null,
      benefits: product.benefits ?? null,
      fullComposition: product.full_composition ?? null,
      usageMethod: product.usage_method ?? null,
      contraindications: product.contraindications ?? null,
      storageConditions: product.storage_conditions ?? null,
      price: product.price,
      oldPrice: product.old_price ?? null,
      discountPercentage: product.discount_percentage ?? null,
      priority: product.priority ?? 0,
      topSale: product.top_sale ?? false,
      inStock: product.in_stock ?? true,
      limitedEdition: product.limited_edition ?? false,
      stock: product.stock ?? 0,
      categoryId: product.category_id ?? null,
      subcategoryId: product.subcategory_id ?? null,
      fabricComposition: product.fabric_composition ?? null,
      hasLining: product.has_lining ?? false,
      liningDescription: product.lining_description ?? null,
      media: product.media?.length
        ? { create: product.media.map((m) => ({ type: m.type, url: m.url })) }
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
    subtitle?: string | null;
    release_form?: string | null;
    course?: string | null;
    package_weight?: string | null;
    main_info?: string | null;
    short_description?: string | null;
    description?: string | null;
    main_action?: string | null;
    indications_for_use?: string | null;
    benefits?: string | null;
    full_composition?: string | null;
    usage_method?: string | null;
    contraindications?: string | null;
    storage_conditions?: string | null;
    price: number;
    old_price?: number | null;
    discount_percentage?: number | null;
    priority?: number;
    top_sale?: boolean;
    in_stock?: boolean;
    limited_edition?: boolean;
    stock?: number;
    category_id?: number | null;
    subcategory_id?: number | null;
    fabric_composition?: string | null;
    has_lining?: boolean;
    lining_description?: string | null;
    media?: { type: string; url: string }[];
  }
) {
  const oldMedia = await prisma.productMedia.findMany({
    where: { productId: id },
    select: { url: true },
  });
  const oldMediaUrls = oldMedia.map((m) => m.url);
  const newMediaUrls = (update.media || []).map((m) => m.url);
  const filesToDelete = oldMediaUrls.filter(
    (oldUrl) => !newMediaUrls.includes(oldUrl)
  );

  await prisma.$transaction(async (tx) => {
    const slugData: { slug?: string } = {};
    const current = await tx.product.findUnique({ where: { id }, select: { name: true, slug: true } });
    if (current && (!current.slug || current.name !== update.name)) {
      const baseSlug = textToSlug(update.name);
      slugData.slug = await ensureUniqueSlug(baseSlug, (s) =>
        tx.product.findFirst({ where: { slug: s, id: { not: id } } }).then(Boolean)
      );
    }

    await tx.product.update({
      where: { id },
      data: {
        name: update.name,
        ...slugData,
        subtitle: update.subtitle ?? undefined,
        releaseForm: update.release_form ?? undefined,
        course: update.course ?? undefined,
        packageWeight: update.package_weight ?? undefined,
        mainInfo: update.main_info ?? undefined,
        shortDescription: update.short_description ?? undefined,
        description: update.description ?? undefined,
        mainAction: update.main_action ?? undefined,
        indicationsForUse: update.indications_for_use ?? undefined,
        benefits: update.benefits ?? undefined,
        fullComposition: update.full_composition ?? undefined,
        usageMethod: update.usage_method ?? undefined,
        contraindications: update.contraindications ?? undefined,
        storageConditions: update.storage_conditions ?? undefined,
        price: update.price,
        oldPrice: update.old_price ?? undefined,
        discountPercentage: update.discount_percentage ?? undefined,
        priority: update.priority ?? undefined,
        topSale: update.top_sale ?? undefined,
        inStock: update.in_stock ?? undefined,
        limitedEdition: update.limited_edition === true ? true : update.limited_edition === false ? false : undefined,
        stock: update.stock ?? undefined,
        categoryId: update.category_id ?? undefined,
        subcategoryId: update.subcategory_id ?? undefined,
        fabricComposition: update.fabric_composition ?? undefined,
        hasLining: update.has_lining ?? undefined,
        liningDescription: update.lining_description ?? undefined,
      },
    });

    await tx.productMedia.deleteMany({ where: { productId: id } });

    if (update.media?.length) {
      await tx.productMedia.createMany({
        data: update.media.map((m) => ({
          productId: id,
          type: m.type,
          url: m.url,
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

  // Step 2: Відв’язати позиції замовлень (product_name вже збережено в order_items)
  await prisma.orderItem.updateMany({
    where: { productId: id },
    data: { productId: null },
  });

  // Step 3: Delete the product (cascade removes media)
  await prisma.product.delete({
    where: { id },
  });

  // Step 4: Delete files from disk
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
      product_name: item.productName ?? item.product?.name ?? (item.productId != null ? `Товар #${item.productId}` : "Товар"),
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
  promo_code_id?: number | null;
  promo_discount_amount?: number | null;
  items: {
    product_id: number;
    product_name?: string | null;
    size: string;
    quantity: number;
    price: number;
    color?: string | null;
  }[];
};

export async function sqlPostOrder(order: OrderInput) {
  // Transaction: create order and insert items. Використовуємо raw INSERT, щоб не залежати від колонок
  // bonus_points_spent та loyalty_discount_amount, яких може не бути в БД до застосування міграцій.
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
          productName: item.product_name ?? null,
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
        // Колонка bonus_points_spent може відсутня
      }
    }

    const loyaltyDiscount = order.loyalty_discount_amount ?? 0;
    if (loyaltyDiscount > 0) {
      try {
        await tx.$executeRaw`UPDATE orders SET loyalty_discount_amount = ${loyaltyDiscount} WHERE id = ${createdId}`;
      } catch {
        // Колонка loyalty_discount_amount може відсутня
      }
    }

    if (order.promo_code_id != null && order.promo_discount_amount != null) {
      try {
        await tx.$executeRaw`UPDATE orders SET promo_code_id = ${order.promo_code_id}, promo_discount_amount = ${order.promo_discount_amount} WHERE id = ${createdId}`;
        await tx.$executeRaw`UPDATE promo_codes SET used_count = used_count + 1 WHERE id = ${order.promo_code_id}`;
      } catch {
        // Колонки promo можуть відсутня
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
    product_name: item.productName ?? item.product?.name ?? (item.productId != null ? `Товар #${item.productId}` : "Товар"),
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
  product_name?: string | null;
  size: string;
  quantity: number;
  price: number;
  color?: string | null;
}) {
  const created = await prisma.orderItem.create({
    data: {
      orderId: item.order_id,
      productId: item.product_id,
      productName: item.product_name ?? null,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
      color: item.color ?? null,
    },
    include: {
      product: { select: { name: true } },
    },
  });

  return {
    id: created.id,
    order_id: created.orderId,
    product_id: created.productId,
    product_name: created.productName ?? created.product?.name ?? (created.productId != null ? `Товар #${created.productId}` : "Товар"),
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
    product_name?: string | null;
    size?: string;
    quantity?: number;
    price?: number;
  }
) {
  const updated = await prisma.orderItem.update({
    where: { id },
    data: {
      ...(update.product_id !== undefined && { productId: update.product_id }),
      ...(update.product_name !== undefined && { productName: update.product_name }),
      ...(update.size !== undefined && { size: update.size }),
      ...(update.quantity !== undefined && { quantity: update.quantity }),
      ...(update.price !== undefined && { price: update.price }),
    },
    include: {
      product: { select: { name: true } },
    },
  });

  return {
    id: updated.id,
    order_id: updated.orderId,
    product_id: updated.productId,
    product_name: updated.productName ?? updated.product?.name ?? (updated.productId != null ? `Товар #${updated.productId}` : "Товар"),
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
    created_at: order.createdAt,
    items: order.items.map((item) => {
      const product = item.product as { name: string; media?: { url: string; type: string }[] } | null;
      const firstPhoto = product?.media?.find((m) => m.type === "photo");
      const imageUrl = firstPhoto?.url ?? product?.media?.[0]?.url ?? null;
      return {
        product_name: item.productName ?? product?.name ?? (item.productId != null ? `Товар #${item.productId}` : "Товар"),
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

  const result: { id: number; name: string; slug: string | null; priority: number; mediaType: string | null; mediaUrl: string | null }[] = [];
  for (const c of categories) {
    let slug = c.slug;
    if (!slug) {
      const baseSlug = textToSlug(c.name);
      slug = await ensureUniqueSlug(baseSlug, (s) =>
        prisma.category.findFirst({ where: { slug: s, id: { not: c.id } } }).then(Boolean)
      );
      await prisma.category.update({
        where: { id: c.id },
        data: { slug },
      });
    }
    result.push({
      id: c.id,
      name: c.name,
      slug,
      priority: c.priority,
      mediaType: c.mediaType || null,
      mediaUrl: c.mediaUrl || null,
    });
  }
  return result;
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
    slug: category.slug ?? null,
    priority: category.priority,
    mediaType: category.mediaType || null,
    mediaUrl: category.mediaUrl || null,
  };
}

// Get a single category by slug (ЧПУ)
export async function sqlGetCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug: slug || undefined },
  });
  if (!category) return null;
  return {
    id: category.id,
    name: category.name,
    slug: category.slug ?? null,
    priority: category.priority,
    mediaType: category.mediaType || null,
    mediaUrl: category.mediaUrl || null,
  };
}

// Get products by category slug
export async function sqlGetProductsByCategorySlug(categorySlug: string) {
  const cat = await prisma.category.findUnique({
    where: { slug: categorySlug || undefined },
    select: { id: true, name: true },
  });
  if (!cat) return [];
  return sqlGetProductsByCategory(cat.name);
}

// Create a new category
export async function sqlPostCategory(
  name: string, 
  priority: number = 0,
  mediaType?: string | null,
  mediaUrl?: string | null
) {
  const baseSlug = textToSlug(name);
  const slug = await ensureUniqueSlug(baseSlug, (s) =>
    prisma.category.findFirst({ where: { slug: s } }).then(Boolean)
  );

  const createData: {
    name: string;
    slug: string;
    priority: number;
    mediaType?: string | null;
    mediaUrl?: string | null;
  } = { 
    name, 
    slug,
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
    slug: created.slug,
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
    slug?: string;
    mediaType?: string | null;
    mediaUrl?: string | null;
  } = { name, priority };

  const current = await prisma.category.findUnique({ where: { id }, select: { name: true, slug: true } });
  if (current && (!current.slug || current.name !== name)) {
    const baseSlug = textToSlug(name);
    updateData.slug = await ensureUniqueSlug(baseSlug, (s) =>
      prisma.category.findFirst({ where: { slug: s, id: { not: id } } }).then(Boolean)
    );
  }
  
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
    slug: updated.slug ?? null,
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
    slug: sc.slug ?? null,
    category_id: sc.categoryId,
  }));
}

// Get all subcategories for a specific category (backfills slug if missing)
export async function sqlGetSubcategoriesByCategory(categoryId: number) {
  const subcategories = await prisma.subcategory.findMany({
    where: { categoryId },
    orderBy: { id: "asc" },
  });

  const result: { id: number; name: string; slug: string | null; category_id: number }[] = [];
  for (const sc of subcategories) {
    let slug = sc.slug;
    if (!slug) {
      const baseSlug = textToSlug(sc.name);
      slug = await ensureUniqueSlug(baseSlug, (s) =>
        prisma.subcategory.findFirst({ where: { slug: s, id: { not: sc.id } } }).then(Boolean)
      );
      await prisma.subcategory.update({
        where: { id: sc.id },
        data: { slug },
      });
    }
    result.push({
      id: sc.id,
      name: sc.name,
      slug,
      category_id: sc.categoryId,
    });
  }
  return result;
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
    slug: subcategory.slug ?? null,
    category_id: subcategory.categoryId,
  };
}

// Get a single subcategory by slug
export async function sqlGetSubcategoryBySlug(slug: string) {
  const subcategory = await prisma.subcategory.findFirst({
    where: { slug },
  });

  if (!subcategory) return null;

  return {
    id: subcategory.id,
    name: subcategory.name,
    slug: subcategory.slug ?? null,
    category_id: subcategory.categoryId,
  };
}

// Create a new subcategory (generates slug from name)
export async function sqlPostSubcategory(name: string, categoryId: number) {
  const baseSlug = textToSlug(name);
  const slug = await ensureUniqueSlug(baseSlug, (s) =>
    prisma.subcategory.findFirst({ where: { slug: s } }).then(Boolean)
  );
  const created = await prisma.subcategory.create({
    data: { name, slug, categoryId },
  });

  return {
    id: created.id,
    name: created.name,
    slug: created.slug,
    category_id: created.categoryId,
  };
}

// Update a subcategory by ID (updates slug if name changed)
export async function sqlPutSubcategory(
  id: number,
  name: string,
  categoryId: number
) {
  const current = await prisma.subcategory.findUnique({
    where: { id },
    select: { name: true, slug: true },
  });
  type UpdateData = { name: string; categoryId: number; slug?: string };
  const updateData: UpdateData = { name, categoryId };
  if (current && (!current.slug || current.name !== name)) {
    const baseSlug = textToSlug(name);
    updateData.slug = await ensureUniqueSlug(baseSlug, (s) =>
      prisma.subcategory.findFirst({ where: { slug: s, id: { not: id } } }).then(Boolean)
    );
  }
  const updated = await prisma.subcategory.update({
    where: { id },
    data: updateData,
  });

  return {
    id: updated.id,
    name: updated.name,
    slug: updated.slug ?? null,
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
