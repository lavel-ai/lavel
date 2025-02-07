import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

export function createTenantConnection(connectionUrl: string) {
  const sql = neon(connectionUrl);
  return drizzle(sql);
}

// Export the type of the drizzle client
export type DrizzleClient = ReturnType<typeof createTenantConnection>; 