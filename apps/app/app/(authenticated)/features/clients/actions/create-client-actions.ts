'use server'
import { auth } from '@repo/auth/server';
import { getTenantDbClientUtil } from '@/app/utils/get-tenant-db-connection';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { 
  clients,
  addresses,
  contacts,
  clientContacts,
  clientAddresses,
} from '@repo/database/src/tenant-app/schema';
import { type Client } from '@repo/database/src/tenant-app/schema/clients-schema';
import { eq, and, lt } from 'drizzle-orm';
import { getInternalUserId } from '@/app/actions/users/users-actions';

// Import normalizers
import { normalizeClient } from '@repo/database/src/tenant-app/utils/normalize/client';
import { normalizeAddress } from '@repo/database/src/tenant-app/utils/normalize/address';
import { normalizeContact } from '@repo/database/src/tenant-app/utils/normalize/contact';

// Import schemas from the schema factory
import {
  clientFormSchema,
  CompletedClientFormData,
} from '../validation/schema-factory';

// --- Helper Functions ---

/**
 * Transforms and normalizes client form data to database structure
 * @param formData The client form data
 * @param userId The user ID performing the action
 * @returns Normalized client data ready for database insertion
 */
function transformClientData(formData: CompletedClientFormData | Partial<CompletedClientFormData>, userId: string): Omit<Client, 'id' | 'createdAt' | 'updatedAt'> {
  // First transform the structure
  // Then normalize the string values
  return {
    clientType: formData.clientType || 'fisica',
    legalName: normalizeClient.legalName(formData.legalName || ''),
    taxId: normalizeClient.taxId(formData.taxId || ''),
    industry: formData.industry || null,
    category: formData.category || 'otros',
    isConfidential: formData.isConfidential || false,
    preferredLanguage: normalizeClient.language(formData.preferredLanguage),
    notes: formData.notes || null,
    status: formData.status || 'prospecto', 
    leadLawyerId: formData.leadLawyerId || null,
    portalAccess: false, // Temporarily disabled
    portalAccessEmail: normalizeClient.email(formData.billing?.email), // Use billing email if available
    billingName: normalizeClient.legalName(formData.billing?.name),
    billingEmail: normalizeClient.email(formData.billing?.email),
    billingRfc: normalizeClient.taxId(formData.billing?.rfc),
    billingTerms: formData.billing?.billingTerms || null,
    billingCurrency: formData.billing?.billingCurrency || 'MXN',
    createdBy: userId,
    updatedBy: userId,
  };
}

/**
 * Normalizes address data for database insertion
 * @param addressData Raw address data from form
 * @param userId User ID for tracking
 * @returns Normalized address data
 */
function normalizeAddressData(addressData: any, userId: string) {
  return {
    street: normalizeAddress.street(addressData.street),
    city: normalizeAddress.city(addressData.city),
    state: normalizeAddress.state(addressData.state),
    zipCode: normalizeAddress.zipCode(addressData.zipCode),
    country: normalizeAddress.country(addressData.country || 'Mexico'),
    addressType: normalizeAddress.addressType(addressData.addressType || 'oficina'),
    isPrimary: addressData.isPrimary || false,
    isBilling: addressData.isBilling || false,
    createdBy: userId,
    updatedBy: userId,
  };
}

/**
 * Normalizes contact data for database insertion
 * @param contactData Raw contact data from form
 * @param userId User ID for tracking
 * @returns Normalized contact data
 */
function normalizeContactData(contactData: any, userId: string) {
  return {
    contactName: normalizeContact.contactName(contactData.contactName),
    email: normalizeContact.email(contactData.email),
    primaryPhone: normalizeContact.phone(contactData.primaryPhone),
    secondaryPhone: normalizeContact.phone(contactData.secondaryPhone),
    extension: contactData.extension || null,
    role: normalizeContact.role(contactData.role),
    department: normalizeContact.department(contactData.department),
    preferredContactMethod: contactData.preferredContactMethod || 'cualquiera',
    contactType: contactData.contactType || null,
    isPrimary: contactData.isPrimary || false,
    createdBy: userId,
    updatedBy: userId,
  };
}

// --- Server Actions ---

/**
 * Updates an existing client with complete form data
 */
export async function updateClientAction(id: string, formData: CompletedClientFormData) {
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
              .values(normalizeAddressData(addressData, userId))
              .returning();

            if (!newAddress || !newAddress.id) {
              console.error('Failed to create address');
              continue;
            }
            
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
              .values(normalizeContactData(contactData, userId))
              .returning();

            if (!newContact || !newContact.id) {
              console.error('Failed to create contact');
              continue;
            }
            
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
 * Creates a new client with complete form data, handling all related entities sequentially
 */
export async function createClientAction(formData: CompletedClientFormData) {
  console.log('Starting createClientAction with data:', formData);
  
  // 1. Authentication & Authorization
  const { userId } = await auth();
  if (!userId) {
    console.error('Authentication failed: No userId found');
    return {
      status: 'error' as const,
      message: 'Unauthorized',
    };
  }

  // Get internal user ID for consistent references
  const internalUserId = await getInternalUserId();
  if (!internalUserId) {
    console.error('Failed to get internal user ID');
    return {
      status: 'error' as const,
      message: 'Failed to get user information',
    };
  }

  const tenantDb = await getTenantDbClientUtil();

  try {
    // 2. Input Validation - Use a simplified, more lenient schema for server-side validation
    console.log('Validating form data with simplified schema');
    const validationSchema = z.object({
      clientType: z.string().optional(),
      legalName: z.string().min(1, "El nombre del cliente es requerido"),
      taxId: z.string().optional(),
      industry: z.string().optional(),
      category: z.string().optional(),
      isConfidential: z.boolean().optional(),
      preferredLanguage: z.string().optional(),
      notes: z.string().optional().nullable(),
      status: z.string().optional(),
      leadLawyerId: z.string().optional().nullable(),
      addresses: z.array(z.any()).optional(),
      contactInfo: z.array(z.any()).optional(),
      corporations: z.array(z.any()).optional(),
      billing: z.object({
        name: z.string().optional().nullable(),
        email: z.string().optional().nullable(),
        rfc: z.string().optional().nullable(),
        billingTerms: z.string().optional().nullable(),
        billingCurrency: z.string().optional().nullable(),
      }).optional().nullable(),
    });

    const validationResult = validationSchema.safeParse(formData);
    
    if (!validationResult.success) {
      const errors = validationResult.error.flatten();
      console.error('Validation errors:', {
        fieldErrors: errors.fieldErrors,
        formErrors: errors.formErrors
      });
      
      return {
        status: 'error' as const,
        message: 'Invalid form data: ' + errors.formErrors.join(', '),
        errors: errors.fieldErrors,
      };
    }
    
    const validatedData = validationResult.data;
    console.log('Form data validated successfully');

    // 3. Client Record Creation - No transaction, but sequential operations with error handling
    try {
      console.log('Starting sequential database operations');
      
      // 3.1 Create the client record
      const clientData = transformClientData(validatedData, internalUserId);
      
      // Handle status appropriately
      const statusToUse = validatedData.status === 'borrador' ? 'activo' : (validatedData.status || 'activo');
      
      console.log('Inserting client record with status:', statusToUse);
      const [newClient] = await tenantDb.insert(clients)  
        .values({
          ...clientData,
          status: statusToUse,
        })
        .returning();
      
      if (!newClient || !newClient.id) {
        throw new Error('Failed to create client record');
      }
      
      console.log('Client record created with ID:', newClient.id);

      // 3.2 Create addresses if provided
      const addressesIds: string[] = [];
      if (validatedData.addresses && validatedData.addresses.length > 0) {
        console.log('Processing addresses:', validatedData.addresses.length);
        for (const addressData of validatedData.addresses) {
          // Skip empty addresses
          if (!addressData.street && !addressData.city && !addressData.state && !addressData.zipCode) {
            console.log('Skipping empty address');
            continue;
          }
          
          try {
            // Insert address
            const [newAddress] = await tenantDb.insert(addresses)
              .values(normalizeAddressData(addressData, internalUserId))
              .returning();
            
            if (!newAddress || !newAddress.id) {
              console.error('Failed to create address');
              continue;
            }
            
            addressesIds.push(newAddress.id);
            console.log('Address created with ID:', newAddress.id);

            // Create client-address relation
            await tenantDb.insert(clientAddresses)
              .values({
                clientId: newClient.id,
                addressId: newAddress.id,
                createdBy: internalUserId,
                updatedBy: internalUserId,
              });
          } catch (addressError) {
            console.error('Error creating address:', addressError);
            // Continue with next address despite error
          }
        }
      } else {
        console.log('No addresses to process');
      }

      // 3.3 Create contacts if provided
      const contactIds: string[] = [];
      const contactInfoArray = validatedData.contactInfo || [];
      if (contactInfoArray.length > 0) {
        console.log('Processing contacts:', contactInfoArray.length);
        for (const contactData of contactInfoArray) {
          // Skip empty contacts
          if (!contactData.contactName && !contactData.email && !contactData.primaryPhone) {
            console.log('Skipping empty contact');
            continue;
          }
          
          try {
            // Insert contact
            console.log('Creating contact:', contactData.contactName);
            const [newContact] = await tenantDb.insert(contacts)
              .values(normalizeContactData(contactData, internalUserId))
              .returning();
            
            if (!newContact || !newContact.id) {
              console.error('Failed to create contact');
              continue;
            }
            
            contactIds.push(newContact.id);
            console.log('Contact created with ID:', newContact.id);

            // Create client-contact relation
            await tenantDb.insert(clientContacts)
              .values({
                clientId: newClient.id,
                contactId: newContact.id,
                isPrimary: contactData.isPrimary || false,
                createdBy: internalUserId,
                updatedBy: internalUserId,
              });
          } catch (contactError) {
            console.error('Error creating contact:', contactError);
            // Continue with next contact despite error
          }
        }
      } else {
        console.log('No contacts to process');
      }

      // 4. Response Handling - Success case
      return {
        status: 'success' as const,
        message: 'Client created successfully',
        data: { 
          client: newClient,
          addresses: addressesIds,
          contacts: contactIds
        },
      };
    } catch (dbError) {
      // Handle database errors
      console.error('Database error:', dbError);
      
      // Attempt cleanup if needed - This is partial compensation for lack of transactions
      // Ideally we would clean up any created records, but that's complex without transactions
      
      throw dbError;
    }
  } catch (error) {
    // 5. Error Handling
    console.error('Error creating client:', error);
    return {
      status: 'error' as const,
      message: error instanceof Error ? error.message : 'Failed to create client',
    };
  } finally {
    // 6. Cache Management - Revalidate the clients page to reflect changes
    revalidatePath('/clients');
  }
}
