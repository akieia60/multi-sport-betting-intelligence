import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// For testing without database
let pool: Pool | null = null;
let db: any = null;

if (!process.env.DATABASE_URL) {
  console.log("No DATABASE_URL found - using mock data for testing");
  // Create dummy exports for testing
  pool = null;
  db = null;
} else {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
}

export { pool, db };
