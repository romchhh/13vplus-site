-- Add all missing columns to orders table (safe to run multiple times).
-- Prisma may not have applied earlier migrations; this ensures the table matches the schema.

-- user_id (for linking order to logged-in user)
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "user_id" TEXT;

-- bonus_points_spent (bonus points used for this order)
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "bonus_points_spent" INTEGER NOT NULL DEFAULT 0;

-- loyalty_discount_amount (discount from loyalty program in UAH)
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "loyalty_discount_amount" DECIMAL(10,2);

-- Foreign key and index for user_id (only if users table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_user_id_fkey";
    ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    CREATE INDEX IF NOT EXISTS "orders_user_id_idx" ON "orders"("user_id");
  END IF;
END $$;
