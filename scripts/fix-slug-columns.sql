-- Run this if Prisma reports "column (not available) does not exist" (P2022).
-- Adds slug columns to categories, products, subcategories if missing.
--
-- Usage: psql "$DATABASE_URL" -f scripts/fix-slug-columns.sql

-- Categories
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "slug" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_key" ON "categories"("slug");

-- Products
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "slug" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "products_slug_key" ON "products"("slug");

-- Subcategories
ALTER TABLE "subcategories" ADD COLUMN IF NOT EXISTS "slug" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "subcategories_slug_key" ON "subcategories"("slug");

-- Order items: store product name so orders don't depend on product; allow product_id NULL when product is deleted
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "product_name" TEXT;
ALTER TABLE "order_items" ALTER COLUMN "product_id" DROP NOT NULL;
