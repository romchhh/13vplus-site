#!/usr/bin/env ts-node

import { Pool } from "pg";
import fs from "node:fs";
import path from "node:path";

function loadEnvUrl(): string {
  const envPath = path.join(process.cwd(), ".env");
  if (!process.env.DATABASE_URL && fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    const match = content.match(/DATABASE_URL=(.*)/);
    if (match) process.env.DATABASE_URL = match[1].replace(/['"]/g, "");
  }
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
  }
  return process.env.DATABASE_URL;
}

async function runPrismaMigration(pool: Pool): Promise<void> {
  console.log("📦 Running Prisma initial migration...");
  
  const migrationPath = path.join(
    process.cwd(),
    "prisma/migrations/20251210214431_init/migration.sql"
  );

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  const migrationSQL = fs.readFileSync(migrationPath, "utf8");
  
  // Execute the entire migration SQL
  // PostgreSQL allows multiple statements separated by semicolons
  try {
    await pool.query(migrationSQL);
    console.log("  ✅ All tables and constraints created");
  } catch (error: unknown) {
    if (error instanceof Error) {
      // Check if it's a "already exists" error
      if (
        error.message.includes("already exists") ||
        error.message.includes("duplicate key") ||
        error.message.includes("relation") && error.message.includes("already exists")
      ) {
        console.log("  ⚠️  Some objects already exist, continuing...");
        // Try to execute statements one by one to see what's missing
        const statements = migrationSQL
          .split(";")
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && !s.startsWith("--") && !s.startsWith("-- CreateTable") && !s.startsWith("-- AddForeignKey"));

        for (const statement of statements) {
          if (statement.trim() && statement.length > 10) {
            try {
              await pool.query(statement + ";");
            } catch (stmtError: unknown) {
              if (stmtError instanceof Error) {
                if (
                  !stmtError.message.includes("already exists") &&
                  !stmtError.message.includes("duplicate")
                ) {
                  // Only log non-ignorable errors
                  console.log(`  ⚠️  Statement skipped: ${stmtError.message.substring(0, 60)}...`);
                }
              }
            }
          }
        }
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }

  console.log("✅ Prisma migration completed!");
}

async function main() {
  const dbUrl = loadEnvUrl();
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: dbUrl.includes("sslmode=require") ? { rejectUnauthorized: false } : false,
  });

  try {
    await runPrismaMigration(pool);
    console.log("\n✅ Database setup complete!");
    console.log("\n📝 Next steps:");
    console.log("   1. Run custom migrations: npm run migrate");
    console.log("   2. (Optional) Add test products: npm run add-test-products");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`❌ Error: ${error.message}`);
    } else {
      console.error(`❌ Unknown error:`, error);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

