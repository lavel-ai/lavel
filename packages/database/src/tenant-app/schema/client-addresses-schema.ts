import {
  pgTable,
  uuid,
  timestamp,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Junction table for client-address many-to-many relationship
export const clientAddresses = pgTable('client_addresses', {
  clientId: uuid('client_id').notNull(),
  addressId: uuid('address_id').notNull(),
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

export type ClientAddress = typeof clientAddresses.$inferSelect;
export type InsertClientAddress = typeof clientAddresses.$inferInsert;