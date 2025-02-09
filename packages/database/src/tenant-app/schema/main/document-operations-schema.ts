import { jsonb, text, timestamp, uuid, integer, boolean, unique, pgSchema } from "drizzle-orm/pg-core";
import { documents } from "./documents-schema";
import { users } from "./users-schema";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
export const mainSchema = pgSchema("main");

export const documentOperations = mainSchema.table('document_operations', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').notNull().references(() => documents.id),
  
  // Operation details
  operationType: text('operation_type').notNull(),
  operationData: jsonb('operation_data').notNull().$type<any>(),
  position: jsonb('position').notNull().$type<any>(),
  sequenceNumber: integer('sequence_number').notNull(),
  
  // AI interaction tracking
  aiSuggested: boolean('ai_suggested').default(false),
  aiContext: jsonb('ai_context').$type<any>(),
  aiInteractionId: uuid('ai_interaction_id'),
  
  // Operation status
  status: text('status').notNull().default('pending'),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  resolvedBy: uuid('resolved_by').references(() => users.id),
  
  // Audit fields
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
}, (table) => {
  return {
    unqDocumentSequence: unique().on(table.documentId, table.sequenceNumber),
  };
});

export type DocumentOperations = typeof documentOperations.$inferSelect;
export type DocumentOperationsInsert = typeof documentOperations.$inferInsert;

export const documentOperationsInsertSchema = createInsertSchema(documentOperations);
export const documentOperationsSelectSchema = createSelectSchema(documentOperations);