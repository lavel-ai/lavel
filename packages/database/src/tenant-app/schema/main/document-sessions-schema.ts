import { jsonb, text, timestamp, uuid, unique, pgSchema } from "drizzle-orm/pg-core";
import { users } from "./users-schema";
import { documents } from "./documents-schema";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { mainSchema } from "./main-schema-instance";


export const documentSessions = mainSchema.table('document_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').notNull().references(() => documents.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  
  // Session state
  cursorPosition: jsonb('cursor_position').$type<any>(),
  selectionRange: jsonb('selection_range').$type<any>(),
  
  // Session timing
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  
  // Session metadata
  clientInfo: jsonb('client_info').$type<any>(),
}, (table) => {
  return {
    unqDocumentUser: unique().on(table.documentId, table.userId),
  };
});

export type DocumentSessions = typeof documentSessions.$inferSelect;
export type DocumentSessionsInsert = typeof documentSessions.$inferInsert;

export const documentSessionsInsertSchema = createInsertSchema(documentSessions);
export const documentSessionsSelectSchema = createSelectSchema(documentSessions);