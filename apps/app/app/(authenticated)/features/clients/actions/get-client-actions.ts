'use server';

import { auth } from '@repo/auth/server';
import { getTenantDbClientUtil } from '@/app/utils/get-tenant-db-connection';
import { clients } from '@repo/database/src/tenant-app/schema';
import { and, desc, eq, ilike, isNull, or, asc } from 'drizzle-orm';
import { SQL } from 'drizzle-orm';
import { notDeleted } from '@repo/database/src/tenant-app/schema/clients-schema';

export type ClientFilters = {
  search?: string;
  status?: string[];
  type?: string[];
  category?: string[];
};

export type ClientSortOptions = {
  field: string;
  direction: 'asc' | 'desc';
};

export type ClientWithDetails = {
  id: string;
  clientType: string;
  legalName: string;
  taxId: string | null;
  category: string;
  status: string;
  isConfidential: boolean;
  primaryLawyerId: string | null;
  createdAt: string;
  updatedAt: string | null;
  primaryAddress?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  } | null;
  primaryContact?: {
    contactName: string;
    email: string;
    primaryPhone: string;
  } | null;
};

/**
 * Fetches clients with optional filtering, sorting, and pagination
 */
export async function getClients(
  filters?: ClientFilters,
  sort?: ClientSortOptions,
  page = 1,
  pageSize = 10
) {
  const { userId } = await auth();
  if (!userId) {
    return {
      status: 'error' as const,
      message: 'Unauthorized',
    };
  }

  try {
    const tenantDb = await getTenantDbClientUtil();
    
    // Build where conditions
    const whereConditions: any[] = [notDeleted(clients)];
    
    if (filters?.search) {
      whereConditions.push(
        or(
          ilike(clients.legalName, `%${filters.search}%`),
          ilike(clients.taxId || '', `%${filters.search}%`)
        )
      );
    }
    
    if (filters?.status && filters.status.length > 0) {
      whereConditions.push(
        or(...filters.status.map(status => eq(clients.status, status)))
      );
    }
    
    if (filters?.type && filters.type.length > 0) {
      whereConditions.push(
        or(...filters.type.map(type => eq(clients.clientType, type)))
      );
    }
    
    if (filters?.category && filters.category.length > 0) {
      whereConditions.push(
        or(...filters.category.map(category => eq(clients.category, category)))
      );
    }

    // Query all clients with related data
    const clientsData = await tenantDb.query.clients.findMany({
      where: and(...whereConditions),
      orderBy: sort?.field
        ? sort.direction === 'asc'
          ? asc(clients[sort.field as keyof typeof clients] as any)
          : desc(clients[sort.field as keyof typeof clients] as any)
        : desc(clients.createdAt),
      limit: pageSize,
      offset: (page - 1) * pageSize,
      with: {
        clientAddresses: {
          with: {
            address: true,
          },
        },
        clientContacts: {
          with: {
            contact: true,
          },
        },
      },
    });

    // Map to simpler structure
    const clientsWithDetails: ClientWithDetails[] = clientsData.map(client => {
      // Find primary address and contact
      const primaryAddressJoin = client.clientAddresses.find(ca => ca.isPrimary);
      const primaryContactJoin = client.clientContacts.find(cc => cc.isPrimary);
      
      return {
        id: client.id,
        clientType: client.clientType || '',
        legalName: client.legalName,
        taxId: client.taxId,
        category: client.category,
        status: client.status,
        isConfidential: client.isConfidential,
        primaryLawyerId: client.leadLawyerId,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
        primaryAddress: primaryAddressJoin?.address 
          ? {
              street: primaryAddressJoin.address.street,
              city: primaryAddressJoin.address.city,
              state: primaryAddressJoin.address.state,
              country: primaryAddressJoin.address.country,
              zipCode: primaryAddressJoin.address.zipCode,
            } 
          : null,
        primaryContact: primaryContactJoin?.contact
          ? {
              contactName: primaryContactJoin.contact.contactName,
              email: primaryContactJoin.contact.email,
              primaryPhone: primaryContactJoin.contact.primaryPhone,
            }
          : null,
      };
    });

    // Get total count for pagination
    const totalCount = await tenantDb.query.clients.count({
      where: and(...whereConditions),
    });

    return {
      status: 'success' as const,
      data: clientsWithDetails,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  } catch (error) {
    console.error('Error fetching clients:', error);
    return {
      status: 'error' as const,
      message: error instanceof Error ? error.message : 'Failed to fetch clients',
    };
  }
}

/**
 * Fetches a client by ID with all related details
 */
export async function getClientById(clientId: string) {
  const { userId } = await auth();
  if (!userId) {
    return {
      status: 'error' as const,
      message: 'Unauthorized',
    };
  }

  try {
    const tenantDb = await getTenantDbClientUtil();
    
    const client = await tenantDb.query.clients.findFirst({
      where: and(
        eq(clients.id, clientId),
        notDeleted(clients)
      ),
      with: {
        clientAddresses: {
          with: {
            address: true,
          },
        },
        clientContacts: {
          with: {
            contact: true,
          },
        },
      },
    });

    if (!client) {
      return {
        status: 'error' as const,
        message: 'Client not found',
      };
    }

    // Transform to a more convenient structure
    const result = {
      ...client,
      addresses: client.clientAddresses.map(ca => ca.address),
      contacts: client.clientContacts.map(cc => cc.contact),
    };

    return {
      status: 'success' as const,
      data: result,
    };
  } catch (error) {
    console.error('Error fetching client:', error);
    return {
      status: 'error' as const,
      message: error instanceof Error ? error.message : 'Failed to fetch client',
    };
  }
}

// Helper function to import the inArray function since it was missing
function inArray<T extends object, K extends keyof T>(
  column: T[K],
  values: unknown[]
) {
  return sql`${column} IN (${values.join(', ')})`;
}

// Helper for SQL functions
function sql<T>(strings: TemplateStringsArray, ...values: unknown[]): SQL<T> {
  let result = strings[0];
  for (let i = 0; i < values.length; i++) {
    result += String(values[i]) + strings[i + 1];
  }
  return { sql: result } as any;
} 