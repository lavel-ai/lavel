import { pgTable, uuid, text, timestamp, boolean, jsonb, pgSchema } from "drizzle-orm/pg-core";
import { cases } from "./case-schema";
import { clients } from "./clients-schema";
import { corporations } from "./corporations-schema";
import { users } from "./users-schema";
import { relations } from "drizzle-orm/relations";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const caseParties = pgTable('case_parties', {
    id: uuid('id').defaultRandom().primaryKey(),
    
    // Core relationships
    caseId: uuid('case_id')
        .notNull()
        .references(() => cases.id),
    
    // Party identification
    name: text('name').notNull(),          // Official name as it appears in legal documents
    type: text('type')
        .notNull()
        .$type<'individual' | 'corporation' | 'government' | 'other'>(),
    
    // Optional links to our system's entities
    isClient: boolean('is_client').default(false),
    clientId: uuid('client_id')            // Optional link if it's our client
        .references(() => clients.id),
    corporationId: uuid('corporation_id')   // Optional link if it's one of our corporations
        .references(() => corporations.id),
    
    // Role and timeline
    role: text('role').notNull(),          // Their role in this specific case
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date'),        // When this role ended (for tracking changes)
    isActive: boolean('is_active').default(true),
    
    // Additional information
    contactInfo: jsonb('contact_info'),    // Contact details for external parties
    notes: text('notes'),                  // Any relevant notes about their involvement
    
    // Audit trail
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    createdBy: uuid('created_by').notNull().references(() => users.id),
    updatedBy: uuid('updated_by').notNull().references(() => users.id)
});

export const casePartiesRelations = relations(caseParties, ({ one }) => ({
    case: one(cases, {
        fields: [caseParties.caseId],
        references: [cases.id]
    }),
    createdByUser: one(users, {
        fields: [caseParties.createdBy],
        references: [users.id]
    }),
    updatedByUser: one(users, {
        fields: [caseParties.updatedBy],
        references: [users.id]
    })
}));

export type CaseParty = typeof caseParties.$inferSelect;
export type NewCaseParty = typeof caseParties.$inferInsert;

export const casePartyInsertSchema = createInsertSchema(caseParties);
export const casePartySelectSchema = createSelectSchema(caseParties);
// export const casePartyUpdateSchema = casePartyInsertSchema.partial();