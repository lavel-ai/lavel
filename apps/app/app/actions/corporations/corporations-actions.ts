'use server';

import { getTenantDbClientUtil } from '@/app/utils/get-tenant-db-connection';
import { auth } from '@repo/auth/server';
import {
  getAllCorporationsByName,
  getCorporationById,
} from '@repo/database/src/tenant-app/queries/corporations-queries';
import { corporations } from '@repo/database/src/tenant-app/schema';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';
import { z } from 'zod';
import { corporationInsertSchema } from '@repo/database/src/tenant-app/schema/corporations-schema';

/**
 * Fetches all corporations from the tenant database, sorted by name.
 * This function is cached to improve performance.
 * @returns {Promise<null | any[]>} Array of corporation records or null if user is not authenticated.
 */
export const getCorporations = cache(async () => {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }
  const tenantDb = await getTenantDbClientUtil();
  return getAllCorporationsByName(tenantDb);
});

/**
 * Fetches a specific corporation by its ID.
 * This function is cached to improve performance.
 * @param {string} corporationId - The unique identifier of the corporation to fetch.
 * @returns {Promise<null | any>} Corporation record or null if user is not authenticated or corporation not found.
 */
export const getCorporationByIdAction = cache(async (corporationId: string) => {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }
  const tenantDb = await getTenantDbClientUtil();
  return getCorporationById(tenantDb, corporationId);
});

export async function createCorporation(data: z.infer<typeof corporationInsertSchema>) {
  const { userId } = await auth();
  if (!userId) {
    return { status: 'error', message: 'Unauthorized' };
  }

  const tenantDb = await getTenantDbClientUtil();

  try {
    const validatedData = corporationInsertSchema.parse(data); // Validate data
    const createdCorporation = await tenantDb.insert(corporations).values({
      ...validatedData,
      createdBy: userId,
      updatedBy: userId,
    }).returning();

    revalidatePath('/clients'); // Revalidate relevant paths
    return { status: 'success', message: 'Corporation created successfully', data: { corporation: createdCorporation[0] } };
  } catch (error) {
    console.error('Error creating corporation:', error);
    return { status: 'error', message: 'Failed to create corporation' };
  }
}