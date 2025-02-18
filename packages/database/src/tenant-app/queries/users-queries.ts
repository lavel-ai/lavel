import { eq } from 'drizzle-orm';
import { users } from '../schema';
import { TenantDatabase } from '../tenant-connection-db';
/**
 * Retrieves a user from the tenant database by their Clerk authentication ID.
 * This function is used to map external Clerk user IDs to internal tenant database user records.
 *
 * @param {TenantDatabase} tenantDb - The tenant-specific database instance to query
 * @param {string} clerkId - The Clerk authentication ID of the user to find
 * @returns {Promise<{ id: string } | undefined>} A promise that resolves to the user's internal ID if found, undefined otherwise
 *
 * @example
 * const tenantDb = await getTenantDbClientUtil();
 * const user = await getUserByClerkId(tenantDb, 'clerk_user_123');
 * if (user) {
 *   console.log('Internal user ID:', user.id);
 * }
 */
export async function getUserByClerkId(tenantDb: TenantDatabase, clerkId: string) {
  return await tenantDb.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    columns: { id: true },
  });
}
