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

// --- Validation Helpers ---
const normalizeText = {
  uppercase: (text: string | undefined) => text?.toUpperCase().trim() ?? '',
  lowercase: (text: string | undefined) => text?.toLowerCase().trim() ?? '',
  titleCase: (text: string | undefined) => 
    text?.trim()
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase()) ?? '',
  phone: (phone: string | undefined) => 
    phone?.replace(/[^\d+()-]/g, '').trim() ?? '', // Keep only digits, +, (, ), and -
};

// --- Contacts Table ---
export const contacts = pgTable('contacts', {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    contactName: text('contact_name').notNull(),
    role: varchar('role', { length: 20 }),
    primaryPhone: varchar('primary_phone', { length: 20 }).notNull(),
    extension: varchar('extension', { length: 20 }),
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

// --- Validation Schemas ---
// Base contact schema with validation
export const contactSchema = createInsertSchema(contacts);

// Schema for selecting contacts
export const contactSelectSchema = createSelectSchema(contacts); 