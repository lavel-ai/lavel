// packages/database/src/tenant-app/tenant-connection-db.ts
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

// Supply a WebSocket constructor if running in Node.js.
neonConfig.webSocketConstructor = ws;

/**
 * Creates and returns a tenant-specific Drizzle client using a Neon connection pool.
 * 
 * You can pass an optional schema to bind the client to your tenant tables.
 *
 * @param connectionUrl - The tenant's database connection URL.
 * @param schema - (Optional) The tenant schema.
 * @returns A configured Drizzle client.
 */
export function createTenantConnection(connectionUrl: string, schema?: unknown) {
  // Create a new pool using the provided connection URL.
  const pool = new Pool({ connectionString: connectionUrl });
  
  // If a schema is provided, pass it to drizzle. Sometimes the types for the schema
  // may not exactly line up; casting it as any can resolve this.
  if (schema) {
    return drizzle(pool, { schema: schema as any });
  }
  return drizzle(pool);
}

// Export the type of the drizzle client for type-safety elsewhere in your code.
export type DrizzleClient = ReturnType<typeof createTenantConnection>;

/** Note:
If you later wish to improve the type definitions for your schema (instead of casting to any), 
you can refine the types in your tenant schema module so that drizzle’s generic parameters work as expected.
*/