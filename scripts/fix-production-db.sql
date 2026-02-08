-- Виконати на сервері, якщо migrate deploy показує "No pending migrations", а таблиць/колонок не вистачає.
-- Запуск: psql "$DATABASE_URL" -f scripts/fix-production-db.sql
-- або: psql -U postgres -d vplus -f scripts/fix-production-db.sql

-- 1) Таблиця newsletter_campaigns
CREATE TABLE IF NOT EXISTS "newsletter_campaigns" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "is_html" BOOLEAN NOT NULL DEFAULT false,
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "newsletter_campaigns_pkey" PRIMARY KEY ("id")
);

-- 2) Колонки в orders (якщо їх немає)
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "user_id" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "bonus_points_spent" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "loyalty_discount_amount" DECIMAL(10,2);
