import {
    pgTable,
    uuid,
    timestamp,
    text,
    varchar,
  } from 'drizzle-orm/pg-core';
  import { sql } from 'drizzle-orm';
  import { relations } from 'drizzle-orm';
  import { clientAddresses } from './client-addresses-schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
  
  export const addresses = pgTable('addresses', {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    street: text('street').notNull(),
    city: text('city').notNull(),
    state: text('state').notNull(),
    zipCode: varchar('zip_code', { length: 10 }).notNull(),
    country: text('country').notNull(),
    addressType: varchar('address_type', { length: 50 }), // e.g., 'billing', 'shipping', 'home'
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
  
  export const addressesRelations = relations(addresses, ({ many }) => ({
      clientAddresses: many(clientAddresses),
  }));
  
  export type Address = typeof addresses.$inferSelect;
  export type InsertAddress = typeof addresses.$inferInsert;
  
  export const addressInsertSchema = createInsertSchema(addresses);
  export const addressSelectSchema = createSelectSchema(addresses); 