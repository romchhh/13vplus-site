-- New product structure: subtitle, main_info, short_description, main_action, indications, benefits, full_composition, usage_method, contraindications, storage_conditions, in_stock

ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "subtitle" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "main_info" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "short_description" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "main_action" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "indications_for_use" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "benefits" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "full_composition" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "usage_method" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "contraindications" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "storage_conditions" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "in_stock" BOOLEAN NOT NULL DEFAULT true;
