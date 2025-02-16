// apps/app/app/actions/users/tenant-actions.ts
'use server';

import { getTenantConnectionUrl } from '@repo/database/src/tenant-app/queries/tenant-lookup';

/**
 * Server action that retrieves the database connection URL for a specific tenant.
 *
 * This function serves as a wrapper around the server-only getTenantConnectionUrl function,
 * making it accessible as a Next.js server action. It's used in the multi-tenant system
 * to dynamically look up the appropriate database connection URL for a given tenant subdomain.
 *
 * The function utilizes Redis caching to optimize performance by storing frequently accessed
 * connection URLs. If the URL is not in cache, it queries the main database to find the
 * corresponding organization and project information.
 *
 * @param subdomain - The tenant's subdomain identifier (e.g., 'tenant1' from 'tenant1.example.com')
 *
 * @returns Promise<string | null> A promise that resolves to:
 *   - The tenant's database connection URL if found
 *   - null if no matching tenant is found or if an error occurs
 *
 * @example
 * // In a server component or action
 * const connectionUrl = await getTenantConnectionUrlAction('tenant1');
 * if (connectionUrl) {
 *   // Use the connection URL to establish database connection
 * } else {
 *   // Handle case where tenant is not found
 * }
 */
export async function getTenantConnectionUrlAction(
  subdomain: string
): Promise<string | null> {
  return getTenantConnectionUrl(subdomain);
}

