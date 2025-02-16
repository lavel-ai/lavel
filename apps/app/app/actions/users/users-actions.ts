"use server";

import { getTenantDbClientUtil } from "@/app/utils/tenant-db";
import { users } from "@repo/database/src/tenant-app/schema/main/users-schema";
import { auth } from "@repo/auth/server";
import { eq } from "drizzle-orm";

export async function getInternalUserId(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  try {
    const tenantDb = await getTenantDbClientUtil();

    // 🚨 Ensure TypeScript correctly recognizes `query`
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
