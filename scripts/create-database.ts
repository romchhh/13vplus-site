import { Pool } from "pg";
import * as fs from "fs";
import * as path from "node:path";

function loadEnvUrl(): string {
  const envPath = path.join(process.cwd(), ".env");
  if (!process.env.DATABASE_URL && fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    const match = content.match(/DATABASE_URL=(.*)/);
    if (match) process.env.DATABASE_URL = match[1].replace(/['"]/g, "");
  }
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set. Please check your .env file.");
    process.exit(1);
  }
  return process.env.DATABASE_URL;
}

function getDatabaseName(url: string): string {
  // Extract database name from DATABASE_URL
  // Format: postgresql://user:password@host:port/database_name
  const match = url.match(/\/([^\/\?]+)(\?|$)/);
  if (match) {
    return match[1];
  }
  throw new Error("Could not extract database name from DATABASE_URL");
}

function getConnectionUrlWithoutDb(url: string): string {
  // Remove database name from URL to connect to default 'postgres' database
  const match = url.match(/(postgresql:\/\/[^\/]+)\/([^\/\?]+)/);
  if (match) {
    return `${match[1]}/postgres`;
  }
  // If format is different, try to replace database name with 'postgres'
  return url.replace(/\/([^\/\?]+)(\?|$)/, "/postgres$2");
}

async function databaseExists(pool: Pool, dbName: string): Promise<boolean> {
  const result = await pool.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [dbName]
  );
  return result.rows.length > 0;
}

async function createDatabase(pool: Pool, dbName: string): Promise<void> {
  // Check if database already exists
  const exists = await databaseExists(pool, dbName);
  if (exists) {
    console.log(`✓ Database '${dbName}' already exists`);
    return;
  }

  // Create database
  // Note: CREATE DATABASE cannot be run in a transaction, so we use a simple query
  // Use double quotes for database name since it may start with a number
  await pool.query(`CREATE DATABASE "${dbName}"`);
  console.log(`✓ Created database '${dbName}'`);
}

async function main() {
  const dbUrl = loadEnvUrl();
  const dbName = getDatabaseName(dbUrl);
  
  console.log(`📦 Database name: ${dbName}`);
  console.log(`🔗 Connecting to PostgreSQL server...`);

  // Connect to default 'postgres' database to create the target database
  const connectionUrl = getConnectionUrlWithoutDb(dbUrl);
  const pool = new Pool({
    connectionString: connectionUrl,
    ssl: dbUrl.includes("sslmode=require") ? { rejectUnauthorized: false } : false,
  });

  try {
    await createDatabase(pool, dbName);
    console.log(`✅ Database setup complete!`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Run migrations: npm run migrate`);
    console.log(`   2. (Optional) Add test products: npm run add-test-products`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`❌ Error: ${error.message}`);
      if (error.message.includes("already exists")) {
        console.log(`ℹ️  Database '${dbName}' already exists. You can proceed with migrations.`);
      } else {
        console.error(`\n💡 Troubleshooting:`);
        console.error(`   - Check that PostgreSQL server is running`);
        console.error(`   - Verify DATABASE_URL in .env file`);
        console.error(`   - Ensure user has CREATE DATABASE privileges`);
      }
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

