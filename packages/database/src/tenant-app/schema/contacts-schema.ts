import {
    pgTable,
    uuid,
    timestamp,
    text,
    varchar,
    boolean,
  } from 'drizzle-orm/pg-core';
  import { sql } from 'drizzle-orm';
  import { relations } from 'drizzle-orm';
  import { clientContacts } from './client-contacts-schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
  
  // --- Contacts Table ---
  export const contacts = pgTable('contacts', {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    contactName: text('contact_name').notNull(),
    primaryPhone: varchar('primary_phone', { length: 20 }).notNull(),
    secondaryPhone: varchar('secondary_phone', { length: 20 }),
    email: text('email').notNull(),
    preferredContactMethod: varchar('preferred_contact_method', {
      length: 20, 
    }), // e.g., 'phone', 'email'
    isPrimary: boolean('is_primary').default(false),      
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
          .default(sql`CURRENT_TIMESTAMP`)
          .notNull(),
      updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' })
          .default(sql`CURRENT_TIMESTAMP`),
      deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
      createdBy: uuid("created_by").notNull(),
      updatedBy: uuid("updated_by").notNull(),
      deletedBy: uuid("deleted_by"),
  });
  
  export const contactsRelations = relations(contacts, ({ many }) => ({
    clientContacts: many(clientContacts),
  }));
  
  export type Contact = typeof contacts.$inferSelect;
  export type InsertContact = typeof contacts.$inferInsert;
  
  export const contactInsertSchema = createInsertSchema(contacts);
  export const contactSelectSchema = createSelectSchema(contacts); 