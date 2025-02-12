// packages/database/src/tenant-app/utils/tenant-db.ts

import type { DrizzleClient } from '../tenant-connection-db';
import { isTenantRequest } from '../types';
import type { TenantRequest } from '../types';

// We need to extend the Request type to include our dbClient
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DATABASE_URL: string;
        }
    }
}

/**
 * Gets the tenant database client from the request context.
 * This should only be called in route handlers or middleware where the tenant middleware has been applied.
 */
export function getTenantDbClient(request: Request): DrizzleClient {
    if (!isTenantRequest(request)) {
        throw new Error(
            "Tenant database client not initialized. Make sure you're accessing this from a tenant subdomain and the tenant middleware has been applied."
        );
    }
    
    if (!request.dbClient) {
        throw new Error("Tenant database client is not available in the request context.");
    }

    return request.dbClient;
}

/**
 * Helper function to check if we're in a tenant context
 */
export function hasTenantContext(request: Request): boolean {
    return isTenantRequest(request) && !!request.dbClient;
} 