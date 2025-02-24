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
  import { clientAddresses } from './client-addresses-schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { schemaTransformers } from '../utils/text-normalization';

// --- Address Table ---
export const addresses = pgTable('addresses', {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    street: text('street').notNull(),
    city: text('city').notNull(),
    state: text('state').notNull(),
    zipCode: varchar('zip_code', { length: 10 }).notNull(),
    country: text('country').notNull(),
    addressType: varchar('address_type', { length: 50 }), // e.g., 'billing', 'shipping', 'home'
    isPrimary: boolean('is_primary').notNull().default(false),
    isBilling: boolean('is_billing').notNull().default(false),
    // Optional Google Places fields
    placeId: text('place_id'),
    formattedAddress: text('formatted_address'),
    latitude: varchar('latitude', { length: 20 }),
    longitude: varchar('longitude', { length: 20 }),
    // Audit fields
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

// --- Validation Schemas ---
// Base address schema with validation
export const addressSchema = createInsertSchema(addresses, {
  street: schemaTransformers.address.street,
  city: schemaTransformers.address.city,
  state: schemaTransformers.address.state,
  zipCode: schemaTransformers.address.zipCode,
  country: schemaTransformers.address.country,
  addressType: z.enum(['billing', 'shipping', 'home', 'work', 'other']).optional(),
  // Google Places fields are optional
  placeId: z.string().optional(),
  formattedAddress: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

// Schema for selecting addresses
export const addressSelectSchema = createSelectSchema(addresses); 