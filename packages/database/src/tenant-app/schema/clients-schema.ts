import {
  pgTable,
  uuid,
  timestamp,
  text,
  boolean,
  varchar,
  unique,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { users } from './users-schema';
import { teams } from './teams-schema';
import { clientAddresses } from './client-addresses-schema';
import { clientContacts } from './client-contacts-schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { schemaTransformers } from '../utils/text-normalization';
import { profiles } from './profiles-schema';
// Helper for soft delete where clause
export const notDeleted = (table: { deletedAt: any }) => sql`${table.deletedAt} IS NULL`;

export const clients = pgTable(
  'clients',
  {
    // Primary identifier
    id: uuid('id').defaultRandom().primaryKey().notNull(),

    // Core client information
    clientType: varchar('client_type', { length: 20 }).$type<'fisica' | 'moral'>().notNull(),
    legalName: varchar('legal_name', { length: 255 }).notNull(),
    industry: varchar('industry', { length: 255 }).default('Not specified'),

    // Law firm-specific fields
    category: varchar('category', { length: 20 }).$type<'litigio' | 'consultoria' | 'corporativo' | 'otros'>().default('otros').notNull(),
    isConfidential: boolean('is_confidential').default(false).notNull(),
    leadLawyerId: uuid('lead_lawyer_id').references(() => profiles.id),
    status: varchar('status', { length: 20 }).$type<'prospecto' | 'activo' | 'inactivo' | 'archivado' | 'borrador'>().default('prospecto').notNull(),

    // Communication and access
    preferredLanguage: varchar('preferred_language', { length: 5 }).default('es-MX').notNull(),
    portalAccess: boolean('portal_access').default(false).notNull(),
    portalAccessEmail: varchar('portal_access_email', { length: 255 }),

    // Billing
    billingName: varchar('billing_name', { length: 255 }),
    billingEmail: varchar('billing_email', { length: 255 }),
    taxId: varchar('tax_id', { length: 13 }).default(''), // RFC length in Mexico
    billingTerms: varchar('billing_terms', { length: 50 }), // e.g., 'Net 30', 'Hourly'
    billingCurrency: varchar('billing_currency', { length: 3 }).default('MXN').notNull(),

    // Additional info
    notes: text('notes'),

    // Audit trail
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`),
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
    createdBy: uuid('created_by').notNull().references(() => users.id),
    updatedBy: uuid('updated_by').notNull().references(() => users.id),
    deletedBy: uuid('deleted_by').references(() => users.id),
  },
  (table) => {
    return {
      // Unique constraints
      uniqueLegalName: unique('unique_legal_name').on(table.legalName, table.deletedAt), // Allow reuse of names for deleted records

      // Email format check for portal access
      portalEmailCheck: sql`CHECK (portal_access_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')`,
    };
  }
);

export const clientsRelations = relations(clients, ({ one, many }) => ({
  // Address relations
  addresses: many(clientAddresses),

  // Contact relations
  contacts: many(clientContacts),

  // Team relation
  leadLawyer: one(profiles, {
    fields: [clients.leadLawyerId],
    references: [profiles.id],
    relationName: 'client_lead_lawyer',
  }),

  // Audit trail relations
  createdByUser: one(users, {
    fields: [clients.createdBy],
    references: [users.id],
    relationName: 'clients_created_by',
  }),
  updatedByUser: one(users, {
    fields: [clients.updatedBy],
    references: [users.id],
    relationName: 'clients_updated_by',
  }),
  deletedByUser: one(users, {
    fields: [clients.deletedBy],
    references: [users.id],
    relationName: 'clients_deleted_by',
  }),
}));

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// --- Validation Schemas ---
export const clientInsertSchema = createInsertSchema(clients, {
  legalName: schemaTransformers.name,
  taxId: z.string().max(13).optional(),
  portalAccessEmail: schemaTransformers.email.optional(),
});

export const clientSelectSchema = createSelectSchema(clients);