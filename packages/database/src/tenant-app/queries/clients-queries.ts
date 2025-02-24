import { and, eq, lt, sql } from 'drizzle-orm';
import { 
  clients, 
  addresses, 
  contacts, 
  clientAddresses, 
  clientContacts 
} from '../schema';
import { TenantDatabase } from '../tenant-connection-db';
import { Client } from '../schema/clients-schema';
import { InsertAddress } from '../schema/addresses-schema';
import { InsertContact } from '../schema/contacts-schema';

// --- Temporary Client Queries ---
export const temporaryClientQueries = {
  create: async (
    db: TenantDatabase,
    data: {
      userId: string;
      formData: Partial<Client>;
    }
  ) => {
    // Ensure required fields are present
    const baseValues = {
      name: 'Draft Client', // Default name for temporary clients
      clientType: 'person' as const, // Default type
      status: 'draft' as const,
      expiresAt: sql`CURRENT_TIMESTAMP + INTERVAL '48 hours'`,
      lastModified: sql`CURRENT_TIMESTAMP`,
      isActive: true,
      createdBy: data.userId,
      updatedBy: data.userId,
    };

    return await db.insert(clients)
      .values({
        ...baseValues,
        ...data.formData,
      })
      .returning();
  },

  update: async (
    db: TenantDatabase,
    data: {
      id: string;
      userId: string;
      formData: Partial<Client>;
    }
  ) => {
    return await db.update(clients)
      .set({
        ...data.formData,
        lastModified: sql`CURRENT_TIMESTAMP`,
        updatedBy: data.userId
      })
      .where(eq(clients.id, data.id))
      .returning();
  },

  get: async (
    db: TenantDatabase,
    id: string
  ) => {
    return await db.query.clients.findFirst({
      where: eq(clients.id, id),
      with: {
        addresses: true,
        contacts: true
      }
    });
  },

  cleanup: async (db: TenantDatabase) => {
    return await db.delete(clients)
      .where(and(
        eq(clients.status, 'draft'),
        lt(clients.expiresAt, sql`CURRENT_TIMESTAMP`)
      ));
  }
};

// --- Main Client Queries ---
export const clientQueries = {
  create: async (
    db: TenantDatabase,
    data: {
      userId: string;
      client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;
    }
  ) => {
    return await db.insert(clients)
      .values({
        ...data.client,
        status: 'active',
        createdBy: data.userId,
        updatedBy: data.userId
      })
      .returning();
  },

  createAddress: async (
    db: TenantDatabase,
    data: {
      userId: string;
      clientId: string;
      address: InsertAddress;
      isPrimary?: boolean;
      isBilling?: boolean;
    }
  ) => {
    const [newAddress] = await db.insert(addresses)
      .values({
        ...data.address,
        createdBy: data.userId,
        updatedBy: data.userId
      })
      .returning();

    await db.insert(clientAddresses)
      .values({
        clientId: data.clientId,
        addressId: newAddress.id,
        isPrimary: data.isPrimary ?? false,
        isBilling: data.isBilling ?? false,
        createdBy: data.userId,
        updatedBy: data.userId
      });

    return newAddress;
  },

  createContact: async (
    db: TenantDatabase,
    data: {
      userId: string;
      clientId: string;
      contact: InsertContact;
      isPrimary?: boolean;
    }
  ) => {
    const [newContact] = await db.insert(contacts)
      .values({
        ...data.contact,
        createdBy: data.userId,
        updatedBy: data.userId
      })
      .returning();

    await db.insert(clientContacts)
      .values({
        clientId: data.clientId,
        contactId: newContact.id,
        isPrimary: data.isPrimary ?? false,
        createdBy: data.userId,
        updatedBy: data.userId
      });

    return newContact;
  },

  // Existing queries
  getAllByName: async (db: TenantDatabase): Promise<{ id: string; name: string }[]> => {
    return await db.select({
      id: clients.id,
      name: clients.name,
    }).from(clients);
  },

  getById: async (db: TenantDatabase, id: string) => {
    return await db.query.clients.findFirst({
      where: eq(clients.id, id),
      with: {
        addresses: true,
        contacts: true
      }
    });
  }
};