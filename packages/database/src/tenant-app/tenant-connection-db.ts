// packages/database/src/tenant-app/tenant-connection-db.ts

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import { combinedSchema } from './schema';  // This imports your combined schema from index.ts
import type { NeonDatabase } from 'drizzle-orm/neon-serverless';

// Supply a WebSocket constructor if running in Node.js.
neonConfig.webSocketConstructor = ws;

/**
 * Creates and returns a tenant-specific Drizzle client using a Neon connection pool.
 *
 * This client is configured with the combined schema which includes:
 *  - main
 *  - reference
 *  - embeddings
 *
 * @param connectionUrl - The tenant's database connection URL.
 * @returns A properly typed Drizzle client with the combined schema.
 */
export function createTenantConnection(
  connectionUrl: string
): NeonDatabase<typeof combinedSchema> {
  // Create a new pool using the provided connection URL.
  // Under the hood, Neon uses PG Bouncer to efficiently manage these connections.
  const pool = new Pool({ connectionString: connectionUrl });
  
  // Return a Drizzle client, passing in the combined schema.
  return drizzle(pool, { schema: combinedSchema });
}

// Export the type of the drizzle client for type-safety elsewhere in your code.
export type DrizzleClient = ReturnType<typeof createTenantConnection>;

// Cache for database connections to avoid creating multiple connections for the same tenant.
const connectionCache = new Map<string, DrizzleClient>();

/**
 * Gets or creates a tenant database connection from the cache.
 *
 * By caching the connection, we avoid the overhead of reinitializing the pool for each request.
 *
 * @param connectionUrl - The tenant's database connection URL.
 * @returns A cached or new database connection.
 */
export function getTenantConnection(
  connectionUrl: string
): DrizzleClient {
  const cacheKey = connectionUrl; // Using the connection URL as the unique cache key.
  
  if (!connectionCache.has(cacheKey)) {
    connectionCache.set(cacheKey, createTenantConnection(connectionUrl));
  }
  
  return connectionCache.get(cacheKey)!;
}