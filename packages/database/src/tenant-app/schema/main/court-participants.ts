import { pgSchema, pgTable } from "drizzle-orm/pg-core";
import { uuid, timestamp, text, boolean } from "drizzle-orm/pg-core";
import { caseParties } from "./case-parties";
import { users } from "./users-schema";
import { relations } from "drizzle-orm/relations";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { mainSchema } from "./main-schema-instance";

export const courtParticipations = mainSchema.table('court_participations', {
    id: uuid('id').defaultRandom().primaryKey(),
    
    // Links to the case participation
    partyId: uuid('party_id')
        .notNull()
        .references(() => caseParties.id),
    
    // Court-specific information
    courtRole: text('court_role').notNull(),   // Their formal role in court proceedings
    serviceDate: timestamp('service_date'),     // When they were served
    appearanceDate: timestamp('appearance_date'), // When they first appeared
    serviceStatus: text('service_status'),      // Status of service process
    appearanceStatus: text('appearance_status'), // Status of their appearance
    
    // Legal representation
    hasAppearance: boolean('has_appearance').default(false),
    representedBy: text('represented_by'),      // Legal representative information
    
    // Timeline tracking
    lastActionDate: timestamp('last_action_date'),
    nextActionDeadline: timestamp('next_action_deadline'),
    
    // Additional court-specific details
    processStatus: text('process_status'),
    notes: text('notes'),
    
    // Audit trail
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    createdBy: uuid('created_by').notNull().references(() => users.id),
    updatedBy: uuid('updated_by').notNull().references(() => users.id)
});

export const courtParticipationsRelations = relations(courtParticipations, ({ one }) => ({
    party: one(caseParties, {
        fields: [courtParticipations.partyId],
        references: [caseParties.id]
    }),
    createdByUser: one(users, {
        fields: [courtParticipations.createdBy],
        references: [users.id]
    }),
    updatedByUser: one(users, {
        fields: [courtParticipations.updatedBy],
        references: [users.id]
    })
}));

export type CourtParticipation = typeof courtParticipations.$inferSelect;
export type NewCourtParticipation = typeof courtParticipations.$inferInsert;

export const courtParticipationInsertSchema = createInsertSchema(courtParticipations);
export const courtParticipationSelectSchema = createSelectSchema(courtParticipations);