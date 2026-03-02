/**
 * Creates a new PostgreSQL database and optionally updates .env with DATABASE_URL.
 *
 * Usage:
 *   npm run create-new-db              # create wellness_site, update .env
 *   npm run create-new-db -- my_db     # create my_db, update .env
 *   NEW_DB_NAME=my_db npm run create-new-db
 *   npm run create-new-db -- --no-write-env  # only create DB, print URL
 *
 * If db_name is omitted, uses "wellness_site".
 * Connection params from .env DATABASE_URL, or default: current OS user @ localhost:5432 (macOS/Homebrew).
 */

import { Pool } from "pg";
import * as fs from "fs";
import * as path from "node:path";

const DEFAULT_DB_NAME = "wellness_site";

/** On macOS/Homebrew Postgres the default superuser is the current OS user, not "postgres". */
function getDefaultBaseUrl(): string {
  const user = process.env.USER || process.env.USERNAME || "postgres";
  return `postgresql://${user}@localhost:5432`;
}

function loadEnv(): string | null {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return null;
  const content = fs.readFileSync(envPath, "utf8");
  const match = content.match(/DATABASE_URL=(.*)/);
  if (!match) return null;
  return match[1].replace(/['"]/g, "").trim();
}

function getBaseUrl(envUrl: string | null): string {
  if (envUrl) {
    // If .env still has example postgres:postgres (role often missing on macOS), use OS user
    if (envUrl.includes("postgres:postgres@") || envUrl.includes("postgres@localhost")) {
      return getDefaultBaseUrl();
    }
    const m = envUrl.match(/(postgresql:\/\/[^/]+)\/[^/?]+/);
    if (m) return m[1];
  }
  return getDefaultBaseUrl();
}

function updateEnvFile(newDatabaseUrl: string): void {
  const envPath = path.join(process.cwd(), ".env");
  const line = `DATABASE_URL="${newDatabaseUrl}"`;

  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, `${line}\n`, "utf8");
    console.log("✓ Created .env with DATABASE_URL.\n");
    return;
  }

  const content = fs.readFileSync(envPath, "utf8");
  if (/^\s*DATABASE_URL=/m.test(content)) {
    const newContent = content.replace(/^\s*DATABASE_URL=.*$/m, line);
    fs.writeFileSync(envPath, newContent, "utf8");
    console.log("✓ Updated DATABASE_URL in .env.\n");
  } else {
    const append = content.trimEnd().endsWith("\n") ? line : `\n${line}`;
    fs.appendFileSync(envPath, append + "\n", "utf8");
    console.log("✓ Appended DATABASE_URL to .env.\n");
  }
}

async function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const writeEnv = !process.argv.includes("--no-write-env");
  const dbName = process.env.NEW_DB_NAME || args[0] || DEFAULT_DB_NAME;
  const envUrl = loadEnv();
  const baseUrl = getBaseUrl(envUrl);
  const connectionUrl = `${baseUrl}/postgres`;

  console.log(`\n📦 Creating database: ${dbName}`);
  console.log(`🔗 Server: ${baseUrl}\n`);

  const pool = new Pool({
    connectionString: connectionUrl,
    ssl: connectionUrl.includes("sslmode=require") ? { rejectUnauthorized: false } : false,
  });

  try {
    const exists = await pool.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
    if (exists.rows.length > 0) {
      console.log(`✓ Database '${dbName}' already exists.\n`);
    } else {
      await pool.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✓ Created database '${dbName}'.\n`);
    }

    const newDatabaseUrl = `${baseUrl}/${dbName}`;
    if (writeEnv) {
      updateEnvFile(newDatabaseUrl);
    } else {
      console.log("📝 Add or update in your .env file:\n");
      console.log(`DATABASE_URL="${newDatabaseUrl}"\n`);
    }
    console.log("Next step: npm run migrate\n");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("❌ Error:", msg);
    console.error("\n💡 Ensure PostgreSQL is running and the user has CREATE DATABASE privilege.");
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
