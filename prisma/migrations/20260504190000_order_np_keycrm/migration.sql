-- Nova Poshta TTN + tracking cache + KeyCRM linkage
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "nova_poshta_ttn" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "nova_poshta_document_ref" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "np_status_code" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "np_status_name" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "keycrm_order_id" INTEGER;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "keycrm_buyer_id" INTEGER;
