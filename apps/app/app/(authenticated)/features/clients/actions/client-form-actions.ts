'use server'
import { auth } from '@repo/auth/server';
import { getTenantDbClientUtil } from '@/app/utils/get-tenant-db-connection';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { 
  clients,
  addressSchema,
  contactSchema,
  addresses,
  contacts,
  clientContacts,
  clientAddresses,
} from '@repo/database/src/tenant-app/schema';
import { type Client } from '@repo/database/src/tenant-app/schema/clients-schema';
import { type Address } from '@repo/database/src/tenant-app/schema/addresses-schema';
import { type Contact } from '@repo/database/src/tenant-app/schema/contacts-schema';
import { type PgTransaction } from 'drizzle-orm/pg-core';
import { type TenantDatabase } from '@repo/database/src/tenant-app/tenant-connection-db';
import { eq, and, lt } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { getInternalUserId } from '@/app/actions/users/user-actions';

// --- Form Schema Definitions ---

// Define a more flexible status field that accommodates both form and DB values
const statusSchema = z.enum(['prospect', 'active', 'inactive', 'archived', 'draft']);
const clientTypeSchema = z.enum(['fisica', 'moral', 'person', 'company'])
  .transform(val => {
    // Transform form values to DB values
    if (val === 'person') return 'fisica' as const;
    if (val === 'company') return 'moral' as const;
    return val;
  });

// Corporation schema
const corporationSchema = z.object({
  name: z.string(),
  constitutionDate: z.string().optional(),
  notaryNumber: z.number().nullable(),
  notaryState: z.string().optional(),
  instrumentNumber: z.string().optional(),
  notes: z.string().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  clientId: z.string().optional(),
});

// Billing information schema
const billingSchema = z.object({
  name: z.string().optional(),
  rfc: z.string().optional(),
  billingCurrency: z.string().optional(),
  billingTerms: z.string().optional(),
  email: z.string().optional(),
});

// Combined form schema that matches our form structure
const clientFormSchema = z.object({
  id: z.string().uuid().optional(),
  clientType: clientTypeSchema,
  legalName: z.string(),
  taxId: z.string().optional(),
  category: z.enum(['litigio', 'consultoria', 'corporativo', 'otros']).optional(),
  isConfidential: z.boolean().optional(),
  preferredLanguage: z.string().optional(),
  notes: z.string().optional(),
  status: statusSchema.optional(),
  corporations: z.array(corporationSchema).optional(),
  addresses: z.array(addressSchema),
  contactInfo: z.array(contactSchema).optional(),
  portalAccess: z.boolean().optional(),
  portalAccessEmail: z.string().optional(),
  billing: billingSchema.optional(),
  primaryLawyerId: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

// --- Helper Functions ---

// Transforms client form data to match DB schema
function transformClientData(formData: ClientFormData, userId: string): Omit<Client, 'id' | 'createdAt' | 'updatedAt'> {
  // Map form values to DB values
  return {
    clientType: formData.clientType as 'fisica' | 'moral',
    legalName: formData.legalName,
    taxId: formData.taxId || '',
    category: formData.category || 'otros',
    isConfidential: formData.isConfidential || false,
    primaryLawyerId: formData.primaryLawyerId || null,
    status: (formData.status === 'draft' ? 'prospect' : formData.status) as 'prospect' | 'active' | 'inactive' | 'archived',
    preferredLanguage: formData.preferredLanguage || 'es-MX',
    portalAccess: formData.portalAccess || false,
    portalAccessEmail: formData.portalAccessEmail || null,
    billingTerms: formData.billing?.billingTerms || null,
    billingCurrency: formData.billing?.billingCurrency || 'MXN',
    notes: formData.notes || null,
    createdBy: userId,
    updatedBy: userId,
    deletedAt: null,
    deletedBy: null,
  };
}

// --- Temporary Client Actions ---

/**
 * Creates a temporary client record with draft status
 */
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
    const validatedData = clientFormSchema.partial().safeParse(formData);
    if (!validatedData.success) {
      return {
        status: 'error' as const,
        message: 'Invalid form data',
        errors: validatedData.error.flatten().fieldErrors,
      };
    }

    // Create basic client with draft status
    const [newClient] = await tenantDb.insert(clients)
      .values({
        clientType: (validatedData.data.clientType || 'fisica') as 'fisica' | 'moral',
        legalName: validatedData.data.legalName || 'Draft Client',
        taxId: validatedData.data.taxId || '',
        status: 'prospect',  // Use valid status value from schema
        preferredLanguage: validatedData.data.preferredLanguage || 'es-MX',
        createdBy: userId,
        updatedBy: userId,
        // Add expiry for draft clients
        // expiresAt is missing in the schema, so we're not using it
      })
      .returning();

    return {
      status: 'success' as const,
      message: 'Temporary client created',
      data: { client: newClient },
    };
  } catch (error) {
    console.error('Error creating temporary client:', error);
    return {
      status: 'error' as const,
      message: error instanceof Error ? error.message : 'Failed to create temporary client',
    };
  }
}

/**
 * Retrieves the most recent temporary (draft) client for the current user
 */
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
    // Use proper syntax for status field
    const result = await tenantDb.query.clients.findFirst({
      where: (clients, { and, eq }) => and(
        eq(clients.createdBy, userId),
        eq(clients.status, 'prospect') // Use valid status value
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

/**
 * Updates a temporary client with partial form data
 */
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
    const validatedData = clientFormSchema.partial().safeParse(formData);
    if (!validatedData.success) {
      return {
        status: 'error' as const,
        message: 'Invalid form data',
        errors: validatedData.error.flatten().fieldErrors,
      };
    }

    // Transform client data to match DB schema
    const clientData = transformClientData({
      ...validatedData.data,
      status: 'prospect', // Use valid status value
    } as ClientFormData, userId);

    // Update only the client record, not the related entities
    const [updatedClient] = await tenantDb.update(clients)
      .set({
        ...clientData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(clients.id, id))
      .returning();

    return {
      status: 'success' as const,
      message: 'Temporary client updated',
      data: { client: updatedClient },
    };
  } catch (error) {
    console.error('Error updating temporary client:', error);
    return {
      status: 'error' as const,
      message: error instanceof Error ? error.message : 'Failed to update temporary client',
    };
  }
}

/**
 * Creates a new client with complete form data, handling all related entities in a transaction
 */
export async function createClientAction(formData: ClientFormData) {
  const { userId } = await auth();
  if (!userId) {
    return {
      status: 'error' as const,
      message: 'Unauthorized',
    };
  }

  const tenantDb = await getTenantDbClientUtil();

  try {
    // Validate the form data
    const validatedData = clientFormSchema.safeParse(formData);
    if (!validatedData.success) {
      return {
        status: 'error' as const,
        message: 'Invalid form data',
        errors: validatedData.error.flatten().fieldErrors,
      };
    }

    // Execute all operations in a transaction
    return await tenantDb.transaction(async (tx) => {
      try {
        // 1. Create the client record
        const clientData = transformClientData(validatedData.data, userId);
        const [newClient] = await tx.insert(clients)
          .values({
            ...clientData,
            status: validatedData.data.status === 'draft' ? 'active' : (validatedData.data.status || 'active'),
          })
          .returning();

        // 2. Create addresses
        if (validatedData.data.addresses && validatedData.data.addresses.length > 0) {
          for (const addressData of validatedData.data.addresses) {
            // Insert address
            const [newAddress] = await tx.insert(addresses)
              .values({
                street: addressData.street,
                city: addressData.city,
                state: addressData.state,
                zipCode: addressData.zipCode,
                country: addressData.country,
                addressType: addressData.addressType || null,
                isPrimary: addressData.isPrimary || false,
                isBilling: addressData.isBilling || false,
                createdBy: userId,
                updatedBy: userId,
              })
              .returning();

            // Create client-address relation
            await tx.insert(clientAddresses)
              .values({
                clientId: newClient.id,
                addressId: newAddress.id,
                createdBy: userId,
                updatedBy: userId,
              });
          }
        }

        // 3. Create contacts
        if (validatedData.data.contactInfo && validatedData.data.contactInfo.length > 0) {
          for (const contactData of validatedData.data.contactInfo) {
            // Insert contact
            const [newContact] = await tx.insert(contacts)
              .values({
                contactName: contactData.contactName,
                email: contactData.email,
                primaryPhone: contactData.primaryPhone,
                secondaryPhone: contactData.secondaryPhone || null,
                extension: contactData.extension || null,
                role: contactData.role || null,
                preferredContactMethod: contactData.preferredContactMethod || 'any',
                isPrimary: contactData.isPrimary || false,
                createdBy: userId,
                updatedBy: userId,
              })
              .returning();

            // Create client-contact relation
            await tx.insert(clientContacts)
              .values({
                clientId: newClient.id,
                contactId: newContact.id,
                createdBy: userId,
                updatedBy: userId,
              });
          }
        }

        // 4. Create corporations if client type is moral
        // This would require additional tables not shown in the provided files

        // 5. Delete temporary client if converting from draft
        if (validatedData.data.id) {
          await tx.delete(clients)
            .where(eq(clients.id, validatedData.data.id));
        }

        return {
          status: 'success' as const,
          message: 'Client created successfully',
          data: { client: newClient },
        };
      } catch (error) {
        // Transaction will automatically roll back
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

/**
 * Updates an existing client with complete form data
 */
export async function updateClientAction(id: string, formData: ClientFormData) {
  const { userId } = await auth();
  if (!userId) {
    return {
      status: 'error' as const,
      message: 'Unauthorized',
    };
  }

  const tenantDb = await getTenantDbClientUtil();

  try {
    // Validate the form data
    const validatedData = clientFormSchema.safeParse(formData);
    if (!validatedData.success) {
      return {
        status: 'error' as const,
        message: 'Invalid form data',
        errors: validatedData.error.flatten().fieldErrors,
      };
    }

    // Execute all operations in a transaction
    return await tenantDb.transaction(async (tx) => {
      try {
        // 1. Update the client record
        const clientData = transformClientData(validatedData.data, userId);
        const [updatedClient] = await tx.update(clients)
          .set({
            ...clientData,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(clients.id, id))
          .returning();

        // 2. Handle addresses - delete existing and create new
        // First delete existing client-address relations
        await tx.delete(clientAddresses)
          .where(eq(clientAddresses.clientId, id));

        // Create new addresses
        if (validatedData.data.addresses && validatedData.data.addresses.length > 0) {
          for (const addressData of validatedData.data.addresses) {
            // Insert address
            const [newAddress] = await tx.insert(addresses)
              .values({
                street: addressData.street,
                city: addressData.city,
                state: addressData.state,
                zipCode: addressData.zipCode,
                country: addressData.country,
                addressType: addressData.addressType || null,
                isPrimary: addressData.isPrimary || false,
                isBilling: addressData.isBilling || false,
                createdBy: userId,
                updatedBy: userId,
              })
              .returning();

            // Create client-address relation
            await tx.insert(clientAddresses)
              .values({
                clientId: updatedClient.id,
                addressId: newAddress.id,
                createdBy: userId,
                updatedBy: userId,
              });
          }
        }

        // 3. Handle contacts - delete existing and create new
        // First delete existing client-contact relations
        await tx.delete(clientContacts)
          .where(eq(clientContacts.clientId, id));

        // Create new contacts
        if (validatedData.data.contactInfo && validatedData.data.contactInfo.length > 0) {
          for (const contactData of validatedData.data.contactInfo) {
            // Insert contact
            const [newContact] = await tx.insert(contacts)
              .values({
                contactName: contactData.contactName,
                email: contactData.email,
                primaryPhone: contactData.primaryPhone,
                secondaryPhone: contactData.secondaryPhone || null,
                extension: contactData.extension || null,
                role: contactData.role || null,
                preferredContactMethod: contactData.preferredContactMethod || 'any',
                isPrimary: contactData.isPrimary || false,
                createdBy: userId,
                updatedBy: userId,
              })
              .returning();

            // Create client-contact relation
            await tx.insert(clientContacts)
              .values({
                clientId: updatedClient.id,
                contactId: newContact.id,
                createdBy: userId,
                updatedBy: userId,
              });
          }
        }

        return {
          status: 'success' as const,
          message: 'Client updated successfully',
          data: { client: updatedClient },
        };
      } catch (error) {
        // Transaction will automatically roll back
        throw error;
      }
    });
  } catch (error) {
    console.error('Error updating client:', error);
    return {
      status: 'error' as const,
      message: error instanceof Error ? error.message : 'Failed to update client',
    };
  } finally {
    // Revalidate the clients page to reflect changes
    revalidatePath('/clients');
  }
}

/**
 * Deletes a client (soft delete)
 */
export async function deleteClientAction(id: string) {
  const { userId } = await auth();
  if (!userId) {
    return {
      status: 'error' as const,
      message: 'Unauthorized',
    };
  }

  const tenantDb = await getTenantDbClientUtil();

  try {
    // Soft delete
    const [deletedClient] = await tenantDb.update(clients)
      .set({
        deletedAt: new Date().toISOString(),
        deletedBy: userId,
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
      })
      .where(eq(clients.id, id))
      .returning();

    return {
      status: 'success' as const,
      message: 'Client deleted successfully',
      data: { client: deletedClient },
    };
  } catch (error) {
    console.error('Error deleting client:', error);
    return {
      status: 'error' as const,
      message: error instanceof Error ? error.message : 'Failed to delete client',
    };
  } finally {
    // Revalidate the clients page to reflect changes
    revalidatePath('/clients');
  }
}

// Add a helper function to delete temporary client permanently
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

// Cleanup expired temporary clients (can be used in a cron job)
export async function cleanupTemporaryClientsAction() {
  const tenantDb = await getTenantDbClientUtil();

  try {
    // Delete clients older than 48 hours
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const deleted = await tenantDb.delete(clients)
      .where(
        and(
          eq(clients.status, 'prospect'),
          lt(clients.createdAt, twoDaysAgo.toISOString())
        )
      )
      .returning({ id: clients.id });

    return {
      status: 'success',
      message: `${deleted.length} temporary clients cleaned up`,
    };
  } catch (error) {
    console.error('Error cleaning up temporary clients:', error);
    return {
      status: 'error',
      message: 'Failed to clean up temporary clients',
    };
  }
}

