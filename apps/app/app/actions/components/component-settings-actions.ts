// "use server";

// import { getTenantDbClientUtil } from "@/app/utils/tenant-db";
// import { componentSettings } from "@repo/database/src/tenant-app/schema/main/component-settings-schema";
// import { and, eq } from "drizzle-orm";
// import { getInternalUserId } from "@/app/actions/users/users-actions";

// // Get settings for a specific component instance
// export async function getComponentSettings(componentId: string, instanceId: string) {
//   const internalUserId = await getInternalUserId();
//   if (!internalUserId) {
//     return null;
//   }

//   try {
//     const tenantDb = await getTenantDbClientUtil();
//     const settings = await tenantDb.query.componentSettings.findFirst({
//       where: and(
//         eq(componentSettings.userId, internalUserId),
//         eq(componentSettings.componentId, componentId),
//         eq(componentSettings.instanceId, instanceId)
//       ),
//     });
//     return settings;
//   } catch (error) {
//     console.error("Error getting component settings:", error);
//     return null;
//   }
// }

// // Get all settings for a user
// export async function getAllComponentSettings() {
//     const internalUserId = await getInternalUserId();
//     if (!internalUserId) {
//       return [];
//     }

//     try {
//       const tenantDb = await getTenantDbClientUtil();
//       const allSettings = await tenantDb.query.componentSettings.findMany({
//         where: eq(componentSettings.userId, internalUserId),
//       });
//       return allSettings;
//     } catch (error) {
//       console.error("Error getting all component settings:", error);
//       return [];
//     }
// }

// // Set settings for a component instance (create or update)
// export async function setComponentSettings(
//   componentId: string,
//   instanceId: string,
//   settings: any,
//   order: number
// ) {
//   const internalUserId = await getInternalUserId();
//   if (!internalUserId) {
//     throw new Error("User not authenticated or not found in tenant DB");
//   }

//   try {
//     const tenantDb = await getTenantDbClientUtil();
//     // Attempt to update existing settings
//     const updateResult = await tenantDb
//       .update(componentSettings)
//       .set({ settings, updatedAt: new Date(), order: order })
//       .where(
//         and(
//           eq(componentSettings.userId, internalUserId),
//           eq(componentSettings.componentId, componentId),
//           eq(componentSettings.instanceId, instanceId)
//         )
//       )
//       .returning();

//     // If no rows were updated, insert new settings
//     if (updateResult.length === 0) {
//       const insertResult = await tenantDb.insert(componentSettings).values({
//         userId: internalUserId,
//         componentId,
//         instanceId,
//         settings,
//         order
//       }).returning();
//       return insertResult[0];
//     }

//     return updateResult[0];
//   } catch (error) {
//     console.error("Error setting component settings:", error);
//     throw new Error("Failed to set component settings");
//   }
// }

// // Delete settings for a component instance
// export async function deleteComponentSettings(componentId: string, instanceId: string) {
//   const internalUserId = await getInternalUserId();
//   if (!internalUserId) {
//     throw new Error("User not authenticated or not found in tenant DB");
//   }

//   try {
//     const tenantDb = await getTenantDbClientUtil();
//     const result = await tenantDb
//       .delete(componentSettings)
//       .where(
//         and(
//           eq(componentSettings.userId, internalUserId),
//           eq(componentSettings.componentId, componentId),
//           eq(componentSettings.instanceId, instanceId)
//         )
//       )
//       .returning();
//     return result[0];
//   } catch (error) {
//     console.error("Error deleting component settings:", error);
//     throw new Error("Failed to delete component settings");
//   }
// } 