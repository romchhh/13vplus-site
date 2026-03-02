-- CreateTable
CREATE TABLE IF NOT EXISTS "promo_codes" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "valid_from" TIMESTAMP(3),
    "valid_until" TIMESTAMP(3),
    "max_uses" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "promo_codes_code_key" ON "promo_codes"("code");

-- Add promo columns to orders
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "promo_code_id" INTEGER;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "promo_discount_amount" DECIMAL(10,2);

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_promo_code_id_fkey'
  ) THEN
    ALTER TABLE "orders" ADD CONSTRAINT "orders_promo_code_id_fkey"
      FOREIGN KEY ("promo_code_id") REFERENCES "promo_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
