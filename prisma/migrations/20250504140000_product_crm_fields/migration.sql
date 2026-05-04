-- Поля у стилі KeyCRM: опт, габарити, валюта, одиниця, варіанти, назва властивості, додатковий текст
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "wholesale_price" DECIMAL(10,2);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "weight_kg" DECIMAL(10,3);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "length_cm" DECIMAL(10,2);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "width_cm" DECIMAL(10,2);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "height_cm" DECIMAL(10,2);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "unit_type" VARCHAR(32) NOT NULL DEFAULT 'шт';
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "currency_code" VARCHAR(8) NOT NULL DEFAULT 'UAH';
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "has_multiple_variants" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "variant_property_name" VARCHAR(80) NOT NULL DEFAULT 'Колір';
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "extra_fields" TEXT;
