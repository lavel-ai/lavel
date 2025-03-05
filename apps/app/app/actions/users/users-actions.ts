"use server";

import { getTenantDbClientUtil } from "@/app/utils/get-tenant-db-connection";
import { users } from "@repo/database/src/tenant-app/schema";
import { auth } from "@repo/auth/server";
import { eq } from "drizzle-orm";

/**
 * Server action that retrieves the internal user ID for a given Clerk user ID.
 *
 * @returns Promise<string | null> The internal user ID, or null if not found.
 */

export async function getInternalUserId(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  try {
    const tenantDb = await getTenantDbClientUtil();

    const queryDb = tenantDb.query as typeof tenantDb.query;
    type DebugQuery = typeof queryDb;
    
    const user = await queryDb.users.findFirst({
      where: eq(users.clerkId, userId),
      columns: { id: true },
});


    return user?.id ?? null;
  } catch (error) {
    console.error("Error getting internal user ID:", error);
    return null;
  }
}
