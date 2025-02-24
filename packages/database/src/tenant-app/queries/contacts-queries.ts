import { eq, and, isNull } from 'drizzle-orm';
import { contacts } from '../schema';
import { Contact, InsertContact } from '../schema/contacts-schema';
import { TenantDatabase } from '../tenant-connection-db';

export async function getAllContacts(
  tenantDb: TenantDatabase,
  includeDeleted: boolean = false
): Promise<Contact[]> {
  return await tenantDb.query.contacts.findMany({
    where: includeDeleted ? undefined : isNull(contacts.deletedAt),
  });
}

export async function getContactById(
  tenantDb: TenantDatabase,
  contactId: string,
  includeDeleted: boolean = false
): Promise<Contact | undefined> {
  return await tenantDb.query.contacts.findFirst({
    where: and(
      eq(contacts.id, contactId),
      includeDeleted ? undefined : isNull(contacts.deletedAt)
    ),
  });
}

export async function createContact(
  tenantDb: TenantDatabase,
  contact: Omit<InsertContact, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
): Promise<Contact> {
  const [newContact] = await tenantDb.insert(contacts)
    .values(contact)
    .returning();
  return newContact;
}

export async function updateContact(
  tenantDb: TenantDatabase,
  contactId: string,
  contact: Partial<Omit<InsertContact, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>
): Promise<Contact | undefined> {
  const [updatedContact] = await tenantDb.update(contacts)
    .set({
      ...contact,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(contacts.id, contactId))
    .returning();
  return updatedContact;
}

export async function softDeleteContact(
  tenantDb: TenantDatabase,
  contactId: string,
  deletedBy: string
): Promise<Contact | undefined> {
  const [deletedContact] = await tenantDb.update(contacts)
    .set({
      deletedAt: new Date().toISOString(),
      deletedBy,
    })
    .where(eq(contacts.id, contactId))
    .returning();
  return deletedContact;
} 