import { pgTable, pgEnum } from "drizzle-orm/pg-core";
import { jsonb, text, timestamp, uuid, integer, boolean, date, numeric, bigint } from "drizzle-orm/pg-core";
import { cases } from "./case-schema";
import { users } from "./users-schema";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const uploadStatusEnum = pgEnum("upload_status", [
  "pending",
  "uploading",
  "completed",
  "failed"
]);

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  tiptapContent: jsonb('tiptap_content').notNull().$type<any>(), // We'll define the type properly
  
  // Document classification
  documentType: text('document_type').notNull(),
  isTemplate: boolean('is_template').notNull().default(false),
  isCourtDocument: boolean('is_court_document').notNull().default(false),
  typeOfCourtDocument: text('type_of_court_document'),
  language: text('language').notNull().default('es'),
  
  // GCloud Storage Information
  bucketName: text('bucket_name'),
  objectPath: text('object_path'),
  objectName: text('object_name'),
  mimeType: text('mime_type'),
  size: integer('size'),  // in bytes
  md5Hash: text('md5_hash'),  // for integrity verification
  
  // AI and Search Metadata 
  textContent: text('text_content'),  // Extracted text for search
  embedding: jsonb('embedding'),      // Vector embedding for semantic search
  summary: text('summary'),           // AI-generated summary
  keyPhrases: jsonb('key_phrases'),   // Extracted key phrases
  entities: jsonb('entities'),        // Named entities
  documentStructure: jsonb('document_structure'), // Document structure analysis
  confidence: numeric('confidence', { precision: 4, scale: 3 }), // OCR/extraction confidence
  
  // Storage fields
  contentType: text('content_type'),
  uploadStatus: uploadStatusEnum('upload_status').notNull().default("pending"),
  originalName: text('original_name'),
  versions: jsonb('versions').$type<{
    id: string;
    fileName: string;
    uploadedAt: string;
    uploadedBy: string;
  }[]>().default([]),
  
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
