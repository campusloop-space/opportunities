import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

// Load .env.local if present
if (fs.existsSync(".env.local")) {
  const lines = fs.readFileSync(".env.local", "utf8").split("\n");
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
}

async function runMigrations() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is required to run migrations.");
    process.exit(1);
  }

  console.log("Connecting to Neon PostgreSQL...");
  const sql = neon(dbUrl);

  const drizzleDir = path.join(process.cwd(), "drizzle");
  const files = fs
    .readdirSync(drizzleDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  console.log(`Found ${files.length} migration file(s) to process.`);

  for (const file of files) {
    console.log(`Applying migration: ${file}...`);
    const fullPath = path.join(drizzleDir, file);
    const content = fs.readFileSync(fullPath, "utf8");
    const statements = content
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      try {
        await sql.query(statement);
      } catch (err: unknown) {
        const error = err as Error;
        // Ignore already exists errors for safe re-runs
        if (
          error.message?.includes("already exists") ||
          error.message?.includes("duplicate")
        ) {
          // Safe idempotency
          continue;
        }
        console.error(`Error executing statement in ${file}:`, error.message);
        throw error;
      }
    }
    console.log(`Successfully applied: ${file}`);
  }

  console.log("All migrations applied successfully!");
}

runMigrations().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
