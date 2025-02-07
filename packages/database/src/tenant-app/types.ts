import type { DrizzleClient } from './tenant-connection-db';

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DATABASE_URL: string;
        }
    }
}

/**
 * Base interface for requests with tenant database client
 */
export interface TenantRequest extends Request {
    dbClient?: DrizzleClient;
}

/**
 * Type guard to check if a request has tenant context
 */
export function isTenantRequest(request: unknown): request is TenantRequest {
    return request !== null && 
           typeof request === 'object' && 
           'dbClient' in request;
} 