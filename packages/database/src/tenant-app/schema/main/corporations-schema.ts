import { pgSchema, pgTable } from "drizzle-orm/pg-core";
import { uuid, timestamp, text, foreignKey, boolean, varchar, integer, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { clients } from "./clients-schema";
import { users } from "./users-schema";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { mainSchema } from "./main-schema-instance";

export const corporations = mainSchema.table("corporations", {
    // Core identification
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    clientId: uuid("client_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    rfc: varchar("rfc", { length: 13 }),

    // Constitutional information
    constitutionDate: timestamp("constitution_date", { withTimezone: true, mode: 'string' }),
    notaryNumber: integer("notary_number"),
    notaryState: varchar("notary_state", { length: 100 }),
    instrumentNumber: varchar("instrument_number", { length: 100 }),

    // Status and classification
    isActive: boolean("is_active").default(true).notNull(),
    status: varchar("status", { length: 50 }).default('active').notNull(),
    notes: text("notes"),

    // Audit trail
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
    createdBy: uuid("created_by").notNull(),
    updatedBy: uuid("updated_by").notNull()
},
(table) => {
    return {
        // We ensure corporation names are unique within a client
        uniqueNamePerClient: unique("unique_name_per_client")
            .on(table.clientId, table.name),
            
        // Foreign key relationships    
        corporationsClientIdFkey: foreignKey({
            columns: [table.clientId],
            foreignColumns: [clients.id],
            name: "corporations_client_id_fkey",
        }),
        corporationsCreatedByFkey: foreignKey({
            columns: [table.createdBy],
            foreignColumns: [users.id],
            name: "corporations_created_by_fkey"
        }),
        corporationsUpdatedByFkey: foreignKey({
            columns: [table.updatedBy],
            foreignColumns: [users.id],
            name: "corporations_updated_by_fkey"
        })
    }
});

export const corporationsRelations = relations(corporations, ({one, many}) => ({
    // Parent client relationship
    client: one(clients, {
        fields: [corporations.clientId],
        references: [clients.id],
        relationName: "corporation_parent_client"
    }),
    // Audit trail relations
    createdByUser: one(users, {
        fields: [corporations.createdBy],
        references: [users.id],
        relationName: "corporations_created_by"
    }),
    updatedByUser: one(users, {
        fields: [corporations.updatedBy],
        references: [users.id],
        relationName: "corporations_updated_by"
    })
}));

export type Corporation = typeof corporations.$inferSelect;
export type InsertCorporation = typeof corporations.$inferInsert;

export const corporationInsertSchema = createInsertSchema(corporations);
export const corporationSelectSchema = createSelectSchema(corporations);