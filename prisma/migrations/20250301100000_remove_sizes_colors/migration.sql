-- For existing DBs: migrate from product_sizes/product_colors to product.stock, then drop old tables

-- Add stock column if not exists (for DBs created with old init)
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "stock" INTEGER NOT NULL DEFAULT 0;

-- Backfill stock from product_sizes (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_sizes') THEN
    UPDATE products p
    SET stock = COALESCE((
      SELECT SUM(ps.stock)::integer FROM product_sizes ps WHERE ps.product_id = p.id
    ), 0);
  END IF;
END $$;

-- Drop product_sizes if exists
DROP TABLE IF EXISTS "product_sizes" CASCADE;

-- Drop product_colors if exists
DROP TABLE IF EXISTS "product_colors" CASCADE;

-- Drop color column from products if exists
ALTER TABLE "products" DROP COLUMN IF EXISTS "color";
