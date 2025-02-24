'use server'
import { auth } from '@repo/auth/server';
import { getTenantDbClientUtil } from '@/app/utils/get-tenant-db-connection';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { 
  clients,
  type InsertClient,
  addressSchema,
  contactSchema,
  clientInsertSchema,
} from '@repo/database/src/tenant-app/schema';
import { temporaryClientQueries, clientQueries } from '@repo/database/src/tenant-app/queries/clients-queries';
import { type PgTransaction } from 'drizzle-orm/pg-core';
import { type TenantDatabase } from '@repo/database/src/tenant-app/tenant-connection-db';
import { eq } from 'drizzle-orm';
import { getInternalUserId } from '@/app/actions/users/user-actions';
// Define the combined schema that matches our form structure
const clientFormSchema = z.object({
  id: z.string().uuid().optional(), // For temporary client ID
  clientType: z.enum(['person', 'company']),
  // Person-specific fields
  name: z.string().optional(),
  parentLastName: z.string().optional(),
  maternalLastName: z.string().optional(),
  // Company-specific fields
  companyName: z.string().optional(),
  rfc: z.string().optional(),
  // Common fields
  corporationId: z.string().uuid().optional(),
  isActive: z.boolean(),
  addresses: z.array(addressSchema),
  contacts: z.array(contactSchema),
});

type ClientFormData = z.infer<typeof clientInsertSchema>;
type Transaction = PgTransaction<any, any, any>;

// --- Temporary Client Actions ---
export async function createTemporaryClientAction(formData: Partial<ClientFormData>) {
  const userId = await getInternalUserId();
  if (!userId) {
    return {
      status: 'error' as const,
      message: 'Unauthorized',
    };
  }

  const tenantDb = await getTenantDbClientUtil();

  try {
    // Validate the partial form data
    const validatedData = clientInsertSchema.partial().safeParse(formData);
    if (!validatedData.success) {
      return {
        status: 'error' as const,
        message: 'Invalid form data',
        errors: validatedData.error.flatten().fieldErrors,
      };
    }

    const result = await temporaryClientQueries.create(tenantDb, {
      userId,
      formData: validatedData.data,
    });

    return {
      status: 'success' as const,
      message: 'Temporary client created',
      data: { client: result[0] },
    };
  } catch (error) {
    console.error('Error creating temporary client:', error);
    return {
      status: 'error' as const,
      message: error instanceof Error ? error.message : 'Failed to create temporary client',
    };
  }
}

export async function getTemporaryClientAction() {
  const userId = await getInternalUserId();
  if (!userId) {
    return {
      status: 'error' as const,
      message: 'Unauthorized',
    };
  }

  const tenantDb = await getTenantDbClientUtil();

  try {
    // Get the most recent temporary client for this user
    const result = await tenantDb.query.clients.findFirst({
      where: (clients, { and, eq }) => and(
        eq(clients.createdBy, userId),
        eq(clients.status, 'draft')
      ),
      orderBy: (clients, { desc }) => [desc(clients.createdAt)],
      with: {
        addresses: true,
        contacts: true,
      }
    });

    if (!result) {
      return {
        status: 'error' as const,
        message: 'No temporary client found',
      };
    }

    return {
      status: 'success' as const,
      data: { client: result },
    };
  } catch (error) {
    console.error('Error getting temporary client:', error);
    return {
      status: 'error' as const,
      message: error instanceof Error ? error.message : 'Failed to get temporary client',
    };
  }
}

export async function updateTemporaryClientAction(
  id: string,
  formData: Partial<ClientFormData>
) {
  const { userId } = await auth();
  if (!userId) {
    return {
      status: 'error' as const,
      message: 'Unauthorized',
    };
  }

  const tenantDb = await getTenantDbClientUtil();

  try {
    // Validate the partial form data
    const validatedData = clientInsertSchema.partial().safeParse(formData);
    if (!validatedData.success) {
      return {
        status: 'error' as const,
        message: 'Invalid form data',
        errors: validatedData.error.flatten().fieldErrors,
      };
    }

    const result = await temporaryClientQueries.update(tenantDb, {
      id,
      userId,
      formData: validatedData.data,
    });

    return {
      status: 'success' as const,
      message: 'Temporary client updated',
      data: { client: result[0] },
    };
  } catch (error) {
    console.error('Error updating temporary client:', error);
    return {
      status: 'error' as const,
      message: error instanceof Error ? error.message : 'Failed to update temporary client',
    };
  }
}

// --- Main Client Actions ---
export async function createClient(formData: ClientFormData) {
  const { userId } = await auth();
  if (!userId) {
    return {
      status: 'error' as const,
      message: 'Unauthorized',
    };
  }

  const tenantDb = await getTenantDbClientUtil();

  try {
    // Validate the entire form data
    const validatedData = clientInsertSchema.safeParse(formData);
    if (!validatedData.success) {
      return {
        status: 'error' as const,
        message: 'Invalid form data',
        errors: validatedData.error.flatten().fieldErrors,
      };
    }

    // Start transaction
    return await tenantDb.transaction(async (tx) => {
      try {
        // 1. Create the base client
        const [newClient] = await clientQueries.create(tx as unknown as TenantDatabase, {
          userId,
          client: {
            legalName: validatedData.data.legalName,
            clientType: validatedData.data.clientType ?? 'person',
            status: validatedData.data.status ?? 'draft',
            isActive: validatedData.data.isActive ?? true,
            portalAccess: validatedData.data.portalAccess ?? false,
            firstName: validatedData.data.firstName ?? null,
            lastName: validatedData.data.lastName ?? null,
            maternalLastName: validatedData.data.maternalLastName ?? null,
            description: validatedData.data.description ?? null,
            preferredLanguage: validatedData.data.preferredLanguage ?? null,
            billingEmail: validatedData.data.billingEmail ?? null,
            portalAccessEmail: validatedData.data.portalAccessEmail ?? null,
            primaryTeamId: validatedData.data.primaryTeamId ?? null,
            taxId: validatedData.data.taxId ?? null,
            paymentTerms: validatedData.data.paymentTerms ?? null,
            preferredCurrency: validatedData.data.preferredCurrency ?? null,
            billingAddressId: null,
            createdBy: userId,
            updatedBy: userId,
            deletedAt: null,
            deletedBy: null,
            expiresAt: null,
            lastModified: new Date().toISOString(),
          } satisfies Omit<InsertClient, 'id' | 'createdAt' | 'updatedAt'>,
        });

        // 2. Create addresses if provided
        const addresses = validatedData.data.billingAddress ? [validatedData.data.billingAddress] : [];
        if (addresses.length) {
          for (const address of addresses) {
            // Validate address data
            const validatedAddress = addressSchema.safeParse(address);
            if (!validatedAddress.success) {
              throw new Error(`Invalid address data: ${validatedAddress.error.message}`);
            }

            await clientQueries.createAddress(tx as unknown as TenantDatabase, {
              userId,
              clientId: newClient.id,
              address: validatedAddress.data,
              isPrimary: true,
              isBilling: true,
            });
          }
        }

        // 3. Create contacts if provided
        const contacts = validatedData.data.contactInfo ?? [];
        if (contacts.length) {
          for (const contact of contacts) {
            // Validate contact data
            const validatedContact = contactSchema.safeParse(contact);
            if (!validatedContact.success) {
              throw new Error(`Invalid contact data: ${validatedContact.error.message}`);
            }

            await clientQueries.createContact(tx as unknown as TenantDatabase, {
              userId,
              clientId: newClient.id,
              contact: validatedContact.data,
              isPrimary: contact.isPrimary,
            });
          }
        }

        // 4. Delete temporary client if this was a conversion
        if (validatedData.data.id) {
          await temporaryClientQueries.cleanup(tx as unknown as TenantDatabase);
        }

        return {
          status: 'success' as const,
          message: 'Client created successfully',
          data: { client: newClient },
        };
      } catch (error) {
        // Transaction will automatically rollback
        throw error;
      }
    });
  } catch (error) {
    console.error('Error creating client:', error);
    return {
      status: 'error' as const,
      message: error instanceof Error ? error.message : 'Failed to create client',
    };
  } finally {
    // Revalidate the clients page to reflect changes
    revalidatePath('/clients');
  }
}

// Add a helper function to delete temporary client
export async function deleteTemporaryClientAction(clientId: string) {
  const { userId } = await auth();
  if (!userId) {
    return {
      status: 'error',
      message: 'Unauthorized',
    };
  }

  const tenantDb = await getTenantDbClientUtil();

  try {
    await tenantDb.delete(clients)
      .where(eq(clients.id, clientId));

    return {
      status: 'success',
      message: 'Temporary client deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting temporary client:', error);
    return {
      status: 'error',
      message: 'Failed to delete temporary client',
    };
  }
}

