import { pgTable, uuid, boolean, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { clients } from './clients-schema';
import { addresses } from './addresses-schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { sql } from 'drizzle-orm';

// --- Client-Addresses Join Table ---
export const clientAddresses = pgTable('client_addresses', {
    clientId: uuid('client_id').notNull().references(() => clients.id),
    addressId: uuid('address_id').notNull().references(() => addresses.id),
    isPrimary: boolean('is_primary').default(false), // Important: Track the primary address
    isBilling: boolean('is_billing').default(false),
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
    pk: primaryKey(t.clientId, t.addressId)
}));

export const clientAddressesRelations = relations(clientAddresses, ({ one }) => ({
    client: one(clients, { fields: [clientAddresses.clientId], references: [clients.id] }),
    address: one(addresses, { fields: [clientAddresses.addressId], references: [addresses.id] }),
}));

// Client-Addresses Join Table
export const clientAddressInsertSchema = createInsertSchema(clientAddresses);
export const clientAddressSelectSchema = createSelectSchema(clientAddresses); 