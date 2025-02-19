import {
  pgTable,
  uuid,
  timestamp,
  text,
  foreignKey,
  boolean,
  varchar,
  unique,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { corporations } from './corporations-schema';
import { users } from './users-schema';
import { teams } from './teams-schema';
import { addresses } from './addresses-schema';
import { clientAddresses } from './client-addresses-schema';
import { clientContacts } from './client-contacts-schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { contacts } from './contacts-schema';

// Define the structure for billing information
export const clientBillingInfoSchema = {
    billingAddress: {
        street: text("street"),
        city: text("city"),
        state: text("state"),
        zipCode: varchar("zip_code", { length: 10 }),
        country: text("country")
    },
    taxId: varchar("tax_id", { length: 50 }),
    billingEmail: text("billing_email"),
    paymentTerms: text("payment_terms"),
    preferredCurrency: varchar("preferred_currency", { length: 3 })
} as const;

// --- Clients Table ---
export const clients = pgTable(
  'clients',
  {
    // Primary identifier
    id: uuid('id').defaultRandom().primaryKey().notNull(),

    // Basic information
    name: varchar('name', { length: 255 }).notNull(),
    parentLastName: varchar('parent_last_name', { length: 100 }),
    maternalLastName: varchar('maternal_last_name', { length: 100 }),
    clientType: varchar('client_type', { length: 50 })
      .notNull()
      .default('corporation'),
    description: text('description'),

    // Contact and communication  (Removed direct embedding)
    preferredLanguage: varchar('preferred_language', { length: 5 }).default(
      'es'
    ),

    // Access and status
    portalAccess: boolean('portal_access').default(false).notNull(),
    portalAccessEmail: text('portal_access_email').unique(),
    isActive: boolean('is_active').default(true).notNull(),

    // Business and billing (Removed direct embedding, now using address ID)
    billingAddressId: uuid('billing_address_id').references(() => addresses.id), // FK to addresses
    taxId: varchar('tax_id', { length: 50 }),
    billingEmail: text('billing_email'),
    paymentTerms: text('payment_terms'),
    preferredCurrency: varchar('preferred_currency', { length: 3 }),

    primaryTeamId: uuid('primary_team_id').references(() => teams.id),

    // Audit trail
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`),
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
    createdBy: uuid('created_by').notNull(),
    updatedBy: uuid('updated_by').notNull(),
    deletedBy: uuid('deleted_by'),
  },
  (table) => {
    return {
      // Unique constraints
      uniqueClientName: unique('unique_client_name').on(table.name),
      uniquePortalEmail: unique('unique_portal_email').on(
        table.portalAccessEmail
      ),

      // Foreign key constraints
      clientsCreatedByFkey: foreignKey({
        columns: [table.createdBy],
        foreignColumns: [users.id],
        name: 'clients_created_by_auth_users_id',
      }),
      clientsUpdatedByFkey: foreignKey({
        columns: [table.updatedBy],
        foreignColumns: [users.id],
        name: 'clients_updated_by_auth_users_id',
      }),
      clientsPrimaryTeamFkey: foreignKey({
        columns: [table.primaryTeamId],
        foreignColumns: [teams.id],
        name: 'clients_primary_team_id_fkey',
      }),

      // Email format check for portal access
      portalEmailCheck: check(
        'portal_email_check',
        sql`portal_access_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'`
      ),
    };
  }
);

export const clientsRelations = relations(clients, ({ one, many }) => ({
  // Case-related relations
  corporations: many(corporations),

  // Team relation
  primaryTeam: one(teams, {
    fields: [clients.primaryTeamId],
    references: [teams.id],
    relationName: 'client_primary_team',
  }),

  // Address relations
  billingAddress: one(addresses, {
    fields: [clients.billingAddressId],
    references: [addresses.id],
    relationName: 'client_billing_address',
  }),
  addresses: many(clientAddresses), // Use the join table

  // Contact relations
  contacts: many(clientContacts), // Use the join table

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
}));

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// Address
const addressSchema = createInsertSchema(addresses);

// Contact
const contactSchema = createInsertSchema(contacts);

// Client
export const clientInsertSchema = createInsertSchema(clients, {
  billingAddressId: z.string().uuid().optional(), // Make it optional in the Zod schema
}).extend({
  billingAddress: addressSchema.optional(), // Include the full address
  contactInfo: z.array(contactSchema).optional(),
});
export const clientSelectSchema = createSelectSchema(clients);
