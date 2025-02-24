// apps/app/app/actions/users/user-actions.ts

"use server"

import { getTenantDbClientUtil } from "@/app/utils/get-tenant-db-connection";
import { auth } from "@repo/auth/server";
import { getUserByClerkId } from "@repo/database/src/tenant-app/queries/users-queries";

export async function getInternalUserId(): Promise<string | null> {
  const { userId } = await auth();
  console.log("this is the user id", userId);
  if (!userId) {
    return null;
  }

  try {
    const tenantDb = await getTenantDbClientUtil();
    const user = await getUserByClerkId(tenantDb, userId);
    return user?.id ?? null;
  } catch (error) {
    console.error("Error getting internal user ID:", error);
    return null;
  }
}