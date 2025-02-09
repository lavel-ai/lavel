// apps/app/utils/tenant-db.ts
import type { NextRequest } from 'next/server';
import type { DrizzleClient } from '@repo/database/src/tenant-app/tenant-connection-db';

/**
 * Retrieves the tenant database client from the request context.
 * This function should only be called in route handlers or server components
 * that are guaranteed to be within the scope of the tenantMiddleware.
 */
export function getTenantDbClient(request: NextRequest): DrizzleClient {
  const tenantDb = request.tenantDb;
  if (!tenantDb) {
    throw new Error(
      "Tenant database client not initialized. Ensure that tenantMiddleware has run on this request."
    );
  }
  return tenantDb;
}