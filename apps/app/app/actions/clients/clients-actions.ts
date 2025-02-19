'use server';

import { getTenantDbClientUtil } from '@/app/utils/get-tenant-db-connection';
import { auth } from '@repo/auth/server';
import {
  getAllClientsByName,
  getClientById,
} from '@repo/database/src/tenant-app/queries/clients-queries';
import {
  getAllCorporationsByName,
  getCorporationById,
} from '@repo/database/src/tenant-app/queries/corporations-queries';
import { clients, addresses, contacts, clientAddresses, clientContacts } from '@repo/database/src/tenant-app/schema';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';
import { eq } from 'drizzle-orm';
import { clientInsertSchema } from '@repo/database/src/tenant-app/schema/clients-schema';
import { createTenantDbClient } from '@repo/database/src/tenant-app/tenant-connection-db';
import { z } from 'zod';

/**
 * Creates a new client in the tenant database.
 * @param {FormData} formData - The form data containing client information.
 * @returns {Promise<{
 *   status: 'success' | 'error',
 *   message: string,
 *   data?: { client: any }
 * }>} Object containing operation status, message, and created client data if successful.
 * @throws Will return an error object if user is not authenticated or if database operation fails.
 */
export async function createClient(
  formData: z.infer<typeof clientInsertSchema>
) {
  'use server';

  const { userId } = await auth();
  if (!userId) {
    return {
      status: 'error',
      message: 'Unauthorized',
    };
  }

  const tenantDb = await getTenantDbClientUtil();
  const clientId = formData.get('id') as string | undefined;

  try {
    // Validate form data
    const validatedData = clientInsertSchema.safeParse(formData);
    if (!validatedData.success) {
      return {
        status: 'error',
        message: 'Invalid form data',
        errors: validatedData.error.flatten().fieldErrors,
      };
    }

    const { billingAddress, contactInfo, ...clientData } = validatedData.data;

    // --- 1. Create the billing address (if provided) ---
    let billingAddressId: string | undefined;
    if (billingAddress) {
      const [newBillingAddress] = await db.insert(addresses).values(billingAddress).returning({ id: addresses.id });
      billingAddressId = newBillingAddress.id;
    }

    // --- 2. Create the client ---
    const [newClient] = await db.insert(clients).values({
      ...clientData,
      billingAddressId, // Use the ID from the created address
    }).returning();

    // --- 3. Create contacts and link them to the client (if provided) ---
    if (contactInfo && contactInfo.length > 0) {
      for (const contact of contactInfo) {
        const [newContact] = await db.insert(contacts).values(contact).returning();
        await db.insert(clientContacts).values({
          clientId: newClient.id,
          contactId: newContact.id,
        });
      }
    }

    revalidatePath('/clients');
    return {
      status: 'success',
      message: 'Client created successfully',
      data: { client: newClient }, // Return the created client
    };
  } catch (error) {
    console.error('Error creating client:', error);
    return {
      status: 'error',
      message: 'Failed to create client',
    };
  }
}

/**z
 * Fetches all clients from the tenant database.
 * This function is cached to improve performance.
 * @returns {Promise<null | any[]>} Array of client records or null if user is not authenticated.
 */
export const getClients = cache(async () => {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }
  const tenantDb = await getTenantDbClientUtil();
  return getAllClientsByName(tenantDb);
});

/**
 * Fetches a specific client by their ID.
 * This function is cached to improve performance.
 * @param {string} clientId - The unique identifier of the client to fetch.
 * @returns {Promise<null | any>} Client record or null if user is not authenticated or client not found.
 */
export const getClientByIdAction = cache(async (clientId: string) => {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }
  const tenantDb = await getTenantDbClientUtil();
  return getClientById(tenantDb, clientId);
});

export async function createTemporaryClient() {
  const { userId } = await auth();
  if (!userId) {
    return { status: 'error', message: 'Unauthorized' };
  }

  const tenantDb = await getTenantDbClientUtil();

  try {
    const tempClient = await tenantDb.insert(clients).values({
      name: 'TEMP_CLIENT', // Important: Use a recognizable name
      isActive: false, // Important: Mark it as inactive
      createdBy: userId,
      updatedBy: userId,
    }).returning();

    return { status: 'success', data: { client: tempClient[0] } };
  } catch (error) {
    console.error('Error creating temporary client:', error);
    return { status: 'error', message: 'Failed to create temporary client' };
  }
}


