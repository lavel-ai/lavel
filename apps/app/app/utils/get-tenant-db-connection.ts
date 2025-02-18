// apps/app/app/utils/tenant-db.ts
"use server";
import { createTenantDbClient, type TenantDatabase } from '@repo/database/src/tenant-app/tenant-connection-db';
import type { DrizzleClient } from '@repo/database/src/tenant-app/tenant-connection-db';
import { getTenantConnectionUrlAction } from '../actions/users/tenant-actions';

// Extend NextRequest to include our tenant database client.
declare module 'next/server' {
  interface NextRequest {
    tenantDb?: DrizzleClient;
  }
}

let tenantDbClient: TenantDatabase | null = null;

/**
 * Utility function to get the tenant database client in Server Actions and Server Components.
 *
 * It is designed to be used within Server Components or Server Actions.
 *
 * @returns The tenant-specific Drizzle client.
 * @throws Error if tenant identifier cannot be determined or connection URL is not found.
 */
export async function getTenantDbClientUtil(): Promise<TenantDatabase> {
  if (tenantDbClient) {
    return tenantDbClient;
  }

  const connectionString = await getTenantConnectionUrlAction();
  if (!connectionString) {
    throw new Error('Failed to get tenant database connection URL.');
  }

  tenantDbClient = createTenantDbClient(connectionString);
  return tenantDbClient;
}