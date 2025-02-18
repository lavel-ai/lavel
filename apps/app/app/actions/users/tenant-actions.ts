// apps/app/app/actions/users/tenant-actions.ts
'use server';

import { db } from "@repo/database/src/main-app/db";
import { organizations, projects } from "@repo/database/src/main-app/schema";
import { eq } from "drizzle-orm";
import { getTenantIdentifier } from "@/app/utils/tenant-identifier";
import { redis } from '@repo/rate-limit';

const CACHE_TTL_SECONDS = 60 * 60 * 24; // 1 day (adjust as needed)

/**
 * Server action that retrieves the database connection URL for a specific tenant.
 *
 * @returns Promise<string | null> The tenant's database connection URL, or null if not found.
 */
export async function getTenantConnectionUrlAction(): Promise<string | null> {
  const identifier = await getTenantIdentifier();

  if (!identifier) {
    console.error("Tenant identifier not found.");
    return null;
  }
  if (identifier === "") {
    throw new Error(
      "Tenant identifier not found in server action context (main domain access not allowed)."
    );
  }

  const cacheKey = `tenant:connectionUrl:${identifier}`;

  // Try to get from Redis cache
  const cachedUrl = await redis.get<string>(cacheKey);
  if (cachedUrl) {
    console.log(`Cache HIT for tenant: ${identifier}`);
    return cachedUrl;
  }

  console.log(`Cache MISS for tenant: ${identifier}`);

  try {
    // Find the organization with its related project.
    const organization = await db.query.organizations.findFirst({
      where: eq(organizations.slug, identifier),
      with: {
        projects: true, // Fetch the related project
      },
    });

    if (!organization) {
      console.error(`Organization not found for tenant: ${identifier}`);
      return null;
    }

    if (organization.projects.length === 0) {
      console.error(`No project found for organization: ${identifier}`);
      return null;
    }
     if (!organization.projects[0].connectionUrl) {
        console.error(`connectionUrl is null for organization: ${identifier}`);
        return null;
     }

    // Store in Redis cache
    await redis.set(cacheKey, organization.projects[0].connectionUrl, { ex: CACHE_TTL_SECONDS });

    return organization.projects[0].connectionUrl;
  } catch (error) {
    console.error("Error fetching tenant connection URL:", error);
    return null;
  }
}

