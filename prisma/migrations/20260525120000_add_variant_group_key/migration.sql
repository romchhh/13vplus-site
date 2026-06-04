-- Звʼязок варіантів однієї моделі різного кольору (Easy, GRACE тощо)
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "variant_group_key" VARCHAR(255);

CREATE INDEX IF NOT EXISTS "products_variant_group_key_idx" ON "products"("variant_group_key");
