// db/index.ts
import 'dotenv/config'; // Load environment variables if needed (e.g., for default URL)
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { neonConfig } from '@neondatabase/serverless';
import * as schema from './schema'; // Import your combined schema
import ws from 'ws';
/**
 * Creates a Drizzle client connected to a Neon database using the neon-http driver.
 *
 * This function is a factory that takes a connection URL and returns a Drizzle client
 * configured with your combined schema and the neon-http driver.
 *
 * @param connectionUrl - The database connection URL to use.
 * @returns A type-safe Drizzle client instance.
 */

neonConfig.webSocketConstructor = ws;
export type TenantDatabase = NeonHttpDatabase<typeof schema>; // Export the type

export function createTenantDbClient(connectionString: string): TenantDatabase {
  return drizzle(connectionString, { schema: schema });
}

// Export types for convenience
export type DrizzleClient = TenantDatabase; // Alias for clarity - DrizzleClient is now NeonDatabase type
