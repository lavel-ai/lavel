// apps/app/app/utils/tenant-db.ts
"use server";
import type { NextRequest } from 'next/server';
import { createTenantConnection } from '@repo/database/src/tenant-app/tenant-connection-db'; // Import createTenantConnection
import type { DrizzleClient } from '@repo/database/src/tenant-app/tenant-connection-db';
import { getTenantConnectionUrl } from '@repo/database/src/tenant-app/queries/tenant-lookup';
import { getTenantIdentifier } from './tenant-identifier'; // Import getTenantIdentifier server action

// Extend NextRequest to include our tenant database client.
declare module 'next/server' {
  interface NextRequest {
    tenantDb?: DrizzleClient;
  }
}

/**
 * Extracts the tenant identifier from the request headers.
 *
 * In production, we assume the tenant is determined by the subdomain (e.g., "tenant" from "tenant.lavel.ai").
 *
 * @param request - The incoming NextRequest.
 * @returns The tenant identifier as a string.
 */
function extractTenantIdentifier(request: NextRequest): string {
  const host = request.headers.get('host');
  if (!host) {
    throw new Error('Host header not found');
  }
  // Assuming the tenant subdomain is the first segment (e.g., "tenant" from "tenant.lavel.ai")
  return host.split('.')[0];
}

/**
 * Retrieves the tenant database client dynamically for production.
 *
 * This function extracts the tenant identifier (subdomain) from the request,
 * uses it to look up the connection URL via `getTenantConnectionUrl`,
 * and then retrieves a cached or new connection using `getTenantConnection`.
 *
 * @param request - The Next.js request object.
 * @returns A promise that resolves to the tenant database client.
 */
// export async function getTenantDbClient(request: NextRequest): Promise<DrizzleClient> {
//   const tenantIdentifier = extractTenantIdentifier(request);
//   // Dynamically look up the connection URL for this tenant.
//   const dbUrl = await getTenantConnectionUrl(tenantIdentifier);
//   if (!dbUrl) {
//     throw new Error(`No connection URL found for tenant: ${tenantIdentifier}`);
//   }
//   return getTenantConnection(dbUrl);
// }

/**
 * Middleware helper to attach the tenant database client to the request.
 *
 * This helper makes the tenant-specific database client available on `request.tenantDb`,
 * so subsequent middleware and route handlers can query the appropriate database.
 *
 * @param request - The incoming NextRequest.
 */
// export async function attachTenantDbToRequest(request: NextRequest): Promise<void> {
//   const tenantDb = await getTenantDbClient(request);
//   request.tenantDb = tenantDb;
// }


// apps/app/app/utils/tenant-db.ts

// import { createTenantConnection } from '@repo/database/src/tenant-app/tenant-connection-db'; // Import createTenantConnection
// import { getTenantIdentifier } from './tenant-identifier'; // Import getTenantIdentifier server action

/**
 * Utility function to get the tenant database client in Server Actions and Server Components.
 *
 * It is designed to be used within Server Components or Server Actions.
 *
 * @returns The tenant-specific Drizzle client.
 * @throws Error if tenant identifier cannot be determined or connection URL is not found.
 */
export const getTenantDbClientUtil = async (): Promise<DrizzleClient> => {
  try {
    const identifier = await getTenantIdentifier();
    if (!identifier) {
      throw new Error("Tenant identifier not found");
    }

    const connectionUrl = await getTenantConnectionUrl(identifier);
    if (!connectionUrl) {
      throw new Error(`No connection URL found for tenant: ${identifier}`);
    }

    const db = createTenantConnection(connectionUrl) as DrizzleClient; // 🚨 Explicitly cast the type
    return db;
  } catch (error: any) {
    console.error("Error in getTenantDbClientUtil:", error);
    throw new Error(`Failed to get Tenant DB Client: ${error.message}`);
  }
};