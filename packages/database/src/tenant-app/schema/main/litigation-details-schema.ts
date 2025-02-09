import { pgTable, uuid, text, timestamp, date, numeric, boolean, AnyPgColumn, integer, pgSchema } from 'drizzle-orm/pg-core';
import { cases } from './case-schema';
import { users } from './users-schema';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { courthouses } from '../reference';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const mainSchema = pgSchema('main');

export const litigationDetails = mainSchema.table("litigation_details", {
    // Core identification
    id: uuid('id').defaultRandom().primaryKey(),
    caseId: uuid('case_id')
        .notNull()
        .references(() => cases.id),
        
    // Court and filing information
    courthouseId: integer('courthouse_id')
        .references(() => courthouses.id),
    filingNumber: text('filing_number'),  
    // Critical dates
    filingDate: timestamp('filing_date'),           // When case was filed
    admissionDate: timestamp('admission_date'),     // When court accepted case
    serviceDate: timestamp('service_date'),         // When defendants were served
    firstHearingDate: timestamp('first_hearing_date'), // 
    nextHearingDate: timestamp('next_hearing_date'), // 
    
    // Procedural information
    proceedingType: text('proceeding_type').notNull(),  // Type of legal proceeding
    currentStage: text('current_stage').notNull(),      // Current stage in process
    
    // // Related proceedings
    // parentProceedingId: uuid('parent_proceeding_id'),  // Remove explicit reference for now
    // relationshipType: text('relationship_type'),
    
    // Financial information
    claimAmount: numeric('claim_amount', { precision: 15, scale: 2 }),
    dateOfCalculation: timestamp('date_of_calculation'),
    realCost: numeric('real_cost', { precision: 10, scale: 2 }),
    
    // Hearing information
    hearingsCount: numeric('hearings_count').default('0'),
    
    // Important deadlines
    nextDeadline: timestamp('next_deadline'),
    responseDeadline: timestamp('response_deadline'),
    appealDeadline: timestamp('appeal_deadline'),
    
    // Additional information
    specialInstructions: text('special_instructions'),
    requiredDocuments: text('required_documents'),
    
    // Time tracking
    totalCourtHours: numeric('total_court_hours', { precision: 10, scale: 2 }).default('0'),
    totalPreparationHours: numeric('total_preparation_hours', { precision: 10, scale: 2 }).default('0'),
    
    // Audit trail
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    createdBy: uuid('created_by').notNull().references(() => users.id),
    updatedBy: uuid('updated_by').notNull().references(() => users.id),
    version: numeric('version').default('1')
});

// Define the relationships after table creation
export const litigationDetailsRelations = relations(litigationDetails, ({ one }) => ({
    // Self-referential relationship
    // parentProceeding: one(litigationDetails, {
    //     fields: [litigationDetails.parentProceedingId],
    //     references: [litigationDetails.id],
    // }),
    
    // Other relationships
    case: one(cases, {
        fields: [litigationDetails.caseId],
        references: [cases.id],
    }),
    createdByUser: one(users, {
        fields: [litigationDetails.createdBy],
        references: [users.id],
    }),
    updatedByUser: one(users, {
        fields: [litigationDetails.updatedBy],
        references: [users.id],
    }),
    courthouse: one(courthouses, {
        fields: [litigationDetails.courthouseId],
        references: [courthouses.id],
    }),
}));

// Type definitions for TypeScript
export type LitigationDetail = typeof litigationDetails.$inferSelect;
export type NewLitigationDetail = typeof litigationDetails.$inferInsert;

export const litigationDetailsInsertSchema = createInsertSchema(litigationDetails);
export const litigationDetailsSelectSchema = createSelectSchema(litigationDetails);