import {
  pgTable,
  uuid,
  timestamp,
  primaryKey,
  boolean,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { clients } from './clients-schema';
import { addresses } from './addresses-schema';

// Junction table for client-address many-to-many relationship
export const clientAddresses = pgTable('client_addresses', {
  clientId: uuid('client_id').notNull().references(() => clients.id),
  addressId: uuid('address_id').notNull().references(() => addresses.id),
  isPrimary: boolean('is_primary').default(false),
  // Audit fields
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  createdBy: uuid('created_by').notNull(),
  updatedBy: uuid('updated_by').notNull(),
  deletedBy: uuid('deleted_by'),
}, (table) => ({
  pk: primaryKey({ columns: [table.clientId, table.addressId] }),
}));

export const clientAddressesRelations = relations(clientAddresses, ({ one }) => ({
  client: one(clients, {
    fields: [clientAddresses.clientId],
    references: [clients.id],
  }),
  address: one(addresses, {
    fields: [clientAddresses.addressId],
    references: [addresses.id],
  }),
}));

export type ClientAddress = typeof clientAddresses.$inferSelect;
export type InsertClientAddress = typeof clientAddresses.$inferInsert;