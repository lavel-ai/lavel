// packages/database/src/tenant-app/queries/tenant-lookup.ts
import 'server-only';
import { db } from '../../main-app/db'; // Main application database client
import { redis } from '@repo/rate-limit'; // Import your Redis client (from rate-limit package)
import { and, eq } from 'drizzle-orm';
import { organizations } from '../../main-app/schema/organizations-schema';
import { projects } from '../../main-app/schema/projects-schema';

const CACHE_TTL_SECONDS = 60 * 60; // 1 hour cache TTL (adjust as needed)

/**
 * Retrieves the tenant database connection URL for a given subdomain.
 * Uses Redis caching to minimize database lookups.
 */
export async function getTenantConnectionUrl(subdomain: string): Promise<string | null> {
  const cacheKey = `tenant:connectionUrl:${subdomain}`;

  // 1. Try to get from Redis cache
    const cachedUrl = await redis.get<string>(cacheKey);
    if (cachedUrl) {
        console.log(`Cache HIT for subdomain: ${subdomain}`);
        return cachedUrl;
    }

  console.log(`Cache MISS for subdomain: ${subdomain}`);

  // 2. If not in cache, query the main database
  try {
    const organization = await db.query.organizations.findFirst({
      where: eq(organizations.slug, subdomain), // Use the correct field name!
      columns: { id: true }, // Only select necessary columns
    });

    if (!organization) {
      return null; // Organization not found
    }

    const project = await db.query.projects.findFirst({
      where: eq(projects.organizationId, organization.id),
      columns: { connectionUrl: true },
    });

    const connectionUrl = project?.connectionUrl;

    // 3. Store in Redis cache (if found)
    if (connectionUrl) {
      await redis.set(cacheKey, connectionUrl, { ex: CACHE_TTL_SECONDS });
    }

    return connectionUrl ?? null;
  } catch (error) {
    console.error("Error looking up tenant connection URL:", error);
    return null;
  }
}

/**
 * Clears the connection URL cache for a specific tenant.
 */
export async function clearTenantConnectionCache(subdomain: string): Promise<void> {
  const cacheKey = `tenant:connectionUrl:${subdomain}`;
  await redis.del(cacheKey);
}

/**
 *  Clears all tenant connection URL caches
 */
export async function clearAllTenantConnectionCaches(): Promise<void> {
    const keys = await redis.keys('tenant:connectionUrl:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
}