"use server";

import { getTenantDbClientUtil } from "@/app/utils/tenant-db";
import { kpiOrder } from "@repo/database/src/tenant-app/schema/main/kpi-order-schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getInternalUserId } from "../users/user-actions";

// Fetch KPI order for an organization
export async function getKPIOrder() {
  const userId = await getInternalUserId();

  if(!userId) {
      throw new Error("User not found");
  }

  try {
    const tenantDb = await getTenantDbClientUtil();
    const order = await tenantDb
      .select()
      .from(kpiOrder)
      .where(eq(kpiOrder.userId, userId))
      .orderBy(kpiOrder.order)
      .execute();
    return order;
  } catch (error) {
    console.error("Error fetching KPI order:", error);
    return []; // Return an empty array on error
  }
}

// Update KPI order for an organization
export async function updateKPIOrder(newOrder: { kpiId: string; order: number }[]) {
    const userId = await getInternalUserId();

    if(!userId) {
        throw new Error("User not found");
    }

  try {
    const tenantDb = await getTenantDbClientUtil();
    // Use a transaction to ensure atomicity
    await tenantDb.transaction(async (tx) => {
      // Delete existing order for the organization
      await tx.delete(kpiOrder).where(eq(kpiOrder.userId, userId as any));

      // Insert the new order
      if (newOrder.length) {
        const insertValues = newOrder.map(item => ({
            userId: userId,
            kpiId: item.kpiId,
            order: item.order
        }));

        await tx.insert(kpiOrder).values(insertValues as any);
      }
    });

    revalidatePath("/"); // Revalidate the dashboard page
  } catch (error) {
    console.error("Error updating KPI order:", error);
    throw new Error("Failed to update KPI order"); // Re-throw for better error handling
  }
} 