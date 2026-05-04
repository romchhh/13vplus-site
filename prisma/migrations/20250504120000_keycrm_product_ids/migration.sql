-- KeyCRM sync: store remote ids after export
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "keycrm_product_id" INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS "products_keycrm_product_id_key"
  ON "products"("keycrm_product_id")
  WHERE "keycrm_product_id" IS NOT NULL;

ALTER TABLE "product_sizes" ADD COLUMN IF NOT EXISTS "keycrm_offer_id" INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS "product_sizes_keycrm_offer_id_key"
  ON "product_sizes"("keycrm_offer_id")
  WHERE "keycrm_offer_id" IS NOT NULL;
