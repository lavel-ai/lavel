import { pgTable, pgSchema } from "drizzle-orm/pg-core";
import { jsonb, text, timestamp, uuid, integer, boolean, date } from "drizzle-orm/pg-core";
import { cases } from "./case-schema";
import { users } from "./users-schema";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { mainSchema } from "./main-schema-instance";

export const documents = mainSchema.table('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  tiptapContent: jsonb('tiptap_content').notNull().$type<any>(), // We'll define the type properly
  
  // Document classification
  documentType: text('document_type').notNull(),
  isTemplate: boolean('is_template').notNull().default(false),
  status: text('status').notNull().default('draft'),
  language: text('language').notNull().default('es'),
  
  // Relationships
  caseId: uuid('case_id').references(() => cases.id),

  
  // Important dates
  effectiveDate: date('effective_date'),
  expirationDate: date('expiration_date'),
  signatureDate: date('signature_date'),
  
  // Additional metadata
  metadata: jsonb('metadata').notNull().default({}),
  
  // Document stats
  versionCount: integer('version_count').notNull().default(1),
  wordCount: integer('word_count'),
  
  // Audit fields
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').notNull().references(() => users.id),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: uuid('deleted_by').references(() => users.id),
});

export type Documents = typeof documents.$inferSelect;
export type DocumentsInsert = typeof documents.$inferInsert;

export const documentsInsertSchema = createInsertSchema(documents);
export const documentsSelectSchema = createSelectSchema(documents);
