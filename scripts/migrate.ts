#!/usr/bin/env ts-node

import { Pool } from "pg";
import fs from "node:fs";
import path from "node:path";

type Migration = { id: string; description: string; sql: string };

function loadEnvUrl(): string {
  const envPath = path.join(process.cwd(), ".env");
  if (!process.env.DATABASE_URL && fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    const match = content.match(/DATABASE_URL=(.*)/);
    if (match) process.env.DATABASE_URL = match[1].replace(/['"]/g, "");
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }
  return process.env.DATABASE_URL;
}

// Define this single migration
const migrations: Migration[] = [
  {
    id: "2025-10-22_add_priority_to_categories",
    description: "Add 'priority' column to categories table",
    sql: `
      ALTER TABLE categories
      ADD COLUMN IF NOT EXISTS priority INT DEFAULT 0;
    `,
  },
  {
    id: "2025-10-29_add_product_sizes_stock",
    description: "Ensure product_sizes table with stock tracking and constraints",
    sql: `
      -- 1) Create table if it doesn't exist
      CREATE TABLE IF NOT EXISTS product_sizes (
        id SERIAL PRIMARY KEY,
        product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        size TEXT NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        UNIQUE (product_id, size)
      );

      -- 2) Add stock column if it's missing (for older schemas)
      ALTER TABLE product_sizes
      ADD COLUMN IF NOT EXISTS stock INT NOT NULL DEFAULT 0;

      -- 3) Ensure unique constraint (product_id, size) exists
      DO $$
      DECLARE
        constraint_exists BOOLEAN;
      BEGIN
        -- Check if any unique constraint exists on (product_id, size)
        SELECT EXISTS (
          SELECT 1
          FROM pg_constraint c
          JOIN pg_class t ON c.conrelid = t.oid
          WHERE t.relname = 'product_sizes'
          AND c.contype = 'u'
          AND array_length(c.conkey, 1) = 2
          AND (
            SELECT attname FROM pg_attribute 
            WHERE attrelid = c.conrelid AND attnum = c.conkey[1]
          ) = 'product_id'
          AND (
            SELECT attname FROM pg_attribute 
            WHERE attrelid = c.conrelid AND attnum = c.conkey[2]
          ) = 'size'
        ) INTO constraint_exists;
        
        IF NOT constraint_exists THEN
          ALTER TABLE product_sizes
          ADD CONSTRAINT product_sizes_product_id_size_key UNIQUE (product_id, size);
        END IF;
      EXCEPTION WHEN OTHERS THEN
        -- Constraint might already exist with different name, ignore
        NULL;
      END
      $$;

      -- 4) Ensure non-negative stock constraint exists
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'product_sizes_stock_nonneg'
        ) THEN
          ALTER TABLE product_sizes
          ADD CONSTRAINT product_sizes_stock_nonneg CHECK (stock >= 0);
        END IF;
      END
      $$;

      -- 5) Helpful index for lookups by product
      CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id ON product_sizes(product_id);
    `,
  },
  {
    id: "2025-12-add_user_auth",
    description: "Add NextAuth tables: users, accounts, sessions, verification_tokens, wishlist; user_id on orders",
    sql: `
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL,
        "name" TEXT,
        "email" TEXT,
        "email_verified" TIMESTAMP(3),
        "image" TEXT,
        "password" TEXT,
        "phone" TEXT,
        "address" TEXT,
        "clothing_size" TEXT,
        "birth_date" TIMESTAMP(3),
        "bonus_points" INTEGER NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "accounts" (
        "id" TEXT NOT NULL,
        "user_id" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "provider_account_id" TEXT NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" TEXT,
        "scope" TEXT,
        "id_token" TEXT,
        "session_state" TEXT,
        CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "sessions" (
        "id" TEXT NOT NULL,
        "session_token" TEXT NOT NULL,
        "user_id" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "verification_tokens" (
        "identifier" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "wishlist" (
        "id" SERIAL NOT NULL,
        "user_id" TEXT NOT NULL,
        "product_id" INTEGER NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "wishlist_pkey" PRIMARY KEY ("id")
      );

      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'orders' AND column_name = 'user_id'
        ) THEN
          ALTER TABLE "orders" ADD COLUMN "user_id" TEXT;
        END IF;
      END $$;

      CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
      CREATE UNIQUE INDEX IF NOT EXISTS "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");
      CREATE UNIQUE INDEX IF NOT EXISTS "sessions_session_token_key" ON "sessions"("session_token");
      CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_token_key" ON "verification_tokens"("token");
      CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");
      CREATE UNIQUE INDEX IF NOT EXISTS "wishlist_user_id_product_id_key" ON "wishlist"("user_id", "product_id");

      ALTER TABLE "accounts" DROP CONSTRAINT IF EXISTS "accounts_user_id_fkey";
      ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

      ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_user_id_fkey";
      ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

      ALTER TABLE "wishlist" DROP CONSTRAINT IF EXISTS "wishlist_user_id_fkey";
      ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

      ALTER TABLE "wishlist" DROP CONSTRAINT IF EXISTS "wishlist_product_id_fkey";
      ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

      ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_user_id_fkey";
      ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

      CREATE INDEX IF NOT EXISTS "orders_user_id_idx" ON "orders"("user_id");
      CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
    `,
  },
];

async function ensureMigrationsTable(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id TEXT PRIMARY KEY,
      executed_at TIMESTAMP NOT NULL DEFAULT NOW(),
      description TEXT
    );
  `);
}

async function hasRun(pool: Pool, id: string): Promise<boolean> {
  const res = await pool.query("SELECT 1 FROM _migrations WHERE id = $1", [id]);
  return (res.rowCount ?? 0) > 0;
}

async function recordRun(pool: Pool, id: string, description: string) {
  await pool.query(
    "INSERT INTO _migrations (id, description) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING",
    [id, description]
  );
}

async function main() {
  const dbUrl = loadEnvUrl();
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: dbUrl.includes("sslmode=require") ? { rejectUnauthorized: false } : false,
  });

  await ensureMigrationsTable(pool);

  for (const m of migrations) {
    const done = await hasRun(pool, m.id);
    if (done) {
      console.log(`✓ Skipping ${m.id} (already applied)`);
      continue;
    }
    console.log(`→ Running migration ${m.id}: ${m.description}`);
    await pool.query(m.sql);
    await recordRun(pool, m.id, m.description);
    console.log(`✓ Completed ${m.id}`);
  }

  await pool.end();
  console.log("Migration complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
