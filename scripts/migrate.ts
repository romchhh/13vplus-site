#!/usr/bin/env ts-node

import { Pool } from "pg";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

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

async function baseTablesExist(pool: Pool): Promise<boolean> {
  const r = await pool.query(
    "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories'"
  );
  return (r.rowCount ?? 0) > 0;
}

/** Resolve failed migrations so Prisma can run deploy (e.g. after removing old migration files). */
async function resolveFailedMigrations(pool: Pool): Promise<void> {
  const t = await pool.query(
    "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '_prisma_migrations'"
  );
  if ((t.rowCount ?? 0) === 0) return;
  const res = await pool.query(
    "SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NULL"
  );
  for (const row of res.rows) {
    const name = row.migration_name as string;
    try {
      execSync(`npx prisma migrate resolve --rolled-back "${name}"`, {
        stdio: "pipe",
        cwd: process.cwd(),
      });
      console.log(`  Resolved failed migration: ${name}`);
    } catch {
      // ignore if already resolved or unknown
    }
  }
}

async function main() {
  const dbUrl = loadEnvUrl();
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: dbUrl.includes("sslmode=require") ? { rejectUnauthorized: false } : false,
  });

  try {
    await resolveFailedMigrations(pool);
    if (!(await baseTablesExist(pool))) {
      await pool.query("DROP TABLE IF EXISTS _migrations");
      console.log("→ Base tables missing — applying Prisma migrations...\n");
    }
    execSync("npx prisma migrate deploy", { stdio: "inherit", cwd: process.cwd() });
    console.log("\nMigration complete.");
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
