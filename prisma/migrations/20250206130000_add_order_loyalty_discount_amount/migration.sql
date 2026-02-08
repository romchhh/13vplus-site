-- AlterTable
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "loyalty_discount_amount" DECIMAL(10,2);
