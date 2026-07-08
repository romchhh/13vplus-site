ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "gender" VARCHAR(16) NOT NULL DEFAULT 'women';
CREATE INDEX IF NOT EXISTS "products_gender_idx" ON "products"("gender");
