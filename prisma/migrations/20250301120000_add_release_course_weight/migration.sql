-- Add Форма випуску, Курс, Вага упаковки to products
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "release_form" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "course" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "package_weight" TEXT;
