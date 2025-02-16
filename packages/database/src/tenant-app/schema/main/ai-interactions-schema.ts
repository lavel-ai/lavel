import { jsonb, text, timestamp, uuid, integer, boolean, pgSchema } from "drizzle-orm/pg-core";
import { documents } from "./documents-schema";
import { users } from "./users-schema";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { mainSchema } from "./main-schema-instance";

export const aiInteractions = mainSchema.table('ai_interactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').notNull().references(() => documents.id),
  userId: uuid('user_id').notNull().references(() => users.id),

  // Interaction content
  userQuery: text('user_query').notNull(),
  queryMetadata: jsonb('query_metadata').$type<any>(),
  aiResponse: text('ai_response').notNull(),
  suggestedOperations: jsonb('suggested_operations').$type<any>(),
  
  // Interaction metrics
  responseTime: integer('response_time'),
  tokenCount: integer('token_count'),
  
  // Feedback
  wasHelpful: boolean('was_helpful'),
  userFeedback: text('user_feedback'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type AiInteractions = typeof aiInteractions.$inferSelect;
export type AiInteractionsInsert = typeof aiInteractions.$inferInsert;

export const aiInteractionInsertSchema = createInsertSchema(aiInteractions);
export const aiInteractionSelectSchema = createSelectSchema(aiInteractions);  