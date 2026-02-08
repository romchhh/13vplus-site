-- AlterTable
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "bonus_points_spent" INTEGER NOT NULL DEFAULT 0;
