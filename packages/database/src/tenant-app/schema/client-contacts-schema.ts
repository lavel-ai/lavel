import { pgTable, uuid, boolean, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { clients } from './clients-schema';
import { contacts } from './contacts-schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { sql } from 'drizzle-orm';

// --- Client-Contacts Join Table ---
export const clientContacts = pgTable('client_contacts', {
    clientId: uuid('client_id').notNull().references(() => clients.id),
    contactId: uuid('contact_id').notNull().references(() => contacts.id),
    isPrimary: boolean('is_primary').default(false), // Important: Track the primary contact
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' })
        .default(sql`CURRENT_TIMESTAMP`),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
    createdBy: uuid("created_by").notNull(),
    updatedBy: uuid("updated_by").notNull(),
    deletedBy: uuid("deleted_by"),
}, (t) => ({
    pk: primaryKey(t.clientId, t.contactId)
}));

export const clientContactsRelations = relations(clientContacts, ({ one }) => ({
    client: one(clients, { fields: [clientContacts.clientId], references: [clients.id] }),
    contact: one(contacts, { fields: [clientContacts.contactId], references: [contacts.id] }),
}));

//Client-Contacts Join Table
export const clientContactInsertSchema = createInsertSchema(clientContacts);
export const clientContactSelectSchema = createSelectSchema(clientContacts); 