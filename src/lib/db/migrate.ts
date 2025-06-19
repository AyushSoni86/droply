import { migrate } from "drizzle-orm/neon-http/migrator";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in the environment variables.");
}

async function runMigrations() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);
    await migrate(db, {
      migrationsFolder: "./drizzle",
    });
    console.log("Migrations completed successfully.");
  } catch (error) {
    console.error("Error running migrations:", error);
    process.exit(1);
  }
}

runMigrations()
  .then(() => console.log("Migration script finished."))
  .catch((error) => {
    console.error("Migration script failed:", error);
    process.exit(1);
  });
